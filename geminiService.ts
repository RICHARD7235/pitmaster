
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Supplier, AISuggestion } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateOrderSuggestions = async (
    lowStockProducts: Product[],
    suppliers: Supplier[],
    model: string, // Accept model as a parameter
): Promise<AISuggestion[]> => {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }
    if (lowStockProducts.length === 0) {
        return [];
    }

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

    const prompt = `
        You are 'L'Économe Pitmaster', an intelligent purchasing assistant for a restaurant.
        Your goal is to prevent stock shortages by suggesting optimized orders.
        Priority is 'Économie': always choose the cheapest supplier available.
        
        Analyze the following products that are below their minimum stock level.
        For each product, suggest a quantity to order to bring the stock to at least double the minimum threshold.
        Then, select the supplier with the absolute lowest price per unit.

        Here is the data:
        ${JSON.stringify(productDetailsForPrompt, null, 2)}
        
        Respond ONLY with a valid JSON array matching the provided schema. Each object in the array represents one item to order.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model, // Use the selected model
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
        const suggestions = JSON.parse(jsonText) as AISuggestion[];
        return suggestions;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate AI suggestions. Please check the API key and network connection.");
    }
};