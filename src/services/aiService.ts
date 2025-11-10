
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Supplier, AISuggestion, AIProvider, AIModel } from '../types';

// ==================== CONFIGURATION ====================

interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model: AIModel;
}

// ==================== GEMINI PROVIDER ====================

const generateWithGemini = async (
    prompt: string,
    apiKey: string,
    model: string,
): Promise<AISuggestion[]> => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        productId: { type: Type.STRING },
                        supplierId: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["productId", "supplierId", "quantity", "reasoning"],
                },
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AISuggestion[];
};

// ==================== OPENAI PROVIDER ====================

const generateWithOpenAI = async (
    prompt: string,
    apiKey: string,
    model: string,
): Promise<AISuggestion[]> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that responds with valid JSON only. Do not include any markdown formatting or code blocks.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    // OpenAI might return {suggestions: [...]} or directly [...]
    return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
};

// ==================== ANTHROPIC PROVIDER ====================

const generateWithAnthropic = async (
    prompt: string,
    apiKey: string,
    model: string,
): Promise<AISuggestion[]> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: prompt + '\n\nRespond with a valid JSON array only, without any markdown formatting.'
                }
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
        throw new Error('No content in Anthropic response');
    }

    // Remove potential markdown code blocks
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
};

// ==================== MAIN FUNCTION ====================

export const generateOrderSuggestions = async (
    lowStockProducts: Product[],
    suppliers: Supplier[],
    config: AIConfig,
): Promise<AISuggestion[]> => {
    if (!config.apiKey) {
        throw new Error("API key is not configured for the selected provider.");
    }

    if (lowStockProducts.length === 0) {
        return [];
    }

    // Prepare product details for the prompt
    const productDetailsForPrompt = lowStockProducts.map(p => {
        const availableSuppliers = suppliers
            .filter(s => s.products.some(sp => sp.internalProductId === p.id))
            .map(s => {
                const supplierProduct = s.products.find(sp => sp.internalProductId === p.id);
                return {
                    supplierId: s.id,
                    supplierName: s.name,
                    price: supplierProduct?.price,
                    delivery: s.deliveryDays,
                    minOrder: s.minOrder,
                };
            });

        return {
            id: p.id,
            name: p.name,
            currentStock: `${p.currentStock} ${p.unit}`,
            minStock: `${p.minStock} ${p.unit}`,
            suppliers: availableSuppliers,
        };
    });

    // Build the prompt
    const prompt = `
You are 'L'Économe Pitmaster', an intelligent purchasing assistant for a restaurant.
Your goal is to prevent stock shortages by suggesting optimized orders.
Priority is 'Économie': always choose the cheapest supplier available.

Analyze the following products that are below their minimum stock level.
For each product, suggest a quantity to order to bring the stock to at least double the minimum threshold.
Then, select the supplier with the absolute lowest price per unit.

Here is the data:
${JSON.stringify(productDetailsForPrompt, null, 2)}

Respond with a valid JSON array. Each object in the array must have:
- productId (string): The ID of the product
- supplierId (string): The ID of the selected supplier
- quantity (number): The quantity to order
- reasoning (string): Brief explanation of your choice

Example format:
[
    {
        "productId": "p1",
        "supplierId": "s2",
        "quantity": 10,
        "reasoning": "Selected cheapest supplier at 2.50€/unit, ordering 10 units to reach double minimum stock"
    }
]
`;

    try {
        let suggestions: AISuggestion[];

        // Route to appropriate provider
        switch (config.provider) {
            case 'gemini':
                suggestions = await generateWithGemini(prompt, config.apiKey, config.model);
                break;
            case 'openai':
                suggestions = await generateWithOpenAI(prompt, config.apiKey, config.model);
                break;
            case 'anthropic':
                suggestions = await generateWithAnthropic(prompt, config.apiKey, config.model);
                break;
            default:
                throw new Error(`Unsupported AI provider: ${config.provider}`);
        }

        return suggestions;

    } catch (error) {
        console.error(`Error calling ${config.provider} API:`, error);
        throw new Error(`Failed to generate AI suggestions with ${config.provider}. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// ==================== HELPER FUNCTIONS ====================

export const getAvailableModels = (provider: AIProvider): AIModel[] => {
    switch (provider) {
        case 'gemini':
            return ['gemini-2.5-flash', 'gemini-2.5-pro'];
        case 'openai':
            return ['gpt-4o', 'gpt-4o-mini'];
        case 'anthropic':
            return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
        default:
            return [];
    }
};

export const getDefaultModel = (provider: AIProvider): AIModel => {
    switch (provider) {
        case 'gemini':
            return 'gemini-2.5-flash';
        case 'openai':
            return 'gpt-4o-mini';
        case 'anthropic':
            return 'claude-3-5-haiku-20241022';
        default:
            return 'gemini-2.5-flash';
    }
};

export const getModelDisplayName = (model: AIModel): string => {
    const modelNames: Record<AIModel, string> = {
        'gemini-2.5-flash': 'Gemini 2.5 Flash (Rapide et économique)',
        'gemini-2.5-pro': 'Gemini 2.5 Pro (Plus puissant)',
        'gpt-4o': 'GPT-4o (Plus puissant)',
        'gpt-4o-mini': 'GPT-4o Mini (Rapide et économique)',
        'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (Plus puissant)',
        'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (Rapide et économique)',
    };
    return modelNames[model] || model;
};

export const getProviderDisplayName = (provider: AIProvider): string => {
    const providerNames: Record<AIProvider, string> = {
        gemini: 'Google Gemini',
        openai: 'OpenAI',
        anthropic: 'Anthropic Claude',
    };
    return providerNames[provider] || provider;
};
