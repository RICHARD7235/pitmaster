
import React, { useState, useEffect } from 'react';
import { AppSettings, AIProvider } from '../types';
import { getAvailableModels, getModelDisplayName, getProviderDisplayName, getDefaultModel } from '../services/aiService';

interface PreferencesPageProps {
    settings: AppSettings;
    onSave: (newSettings: AppSettings) => void;
}

const PreferencesPage: React.FC<PreferencesPageProps> = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        // In a real app, this would be an async call to a backend
        setTimeout(() => {
            onSave(localSettings);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000); // Reset status after 2s
        }, 500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value as AIProvider;
        const newModel = getDefaultModel(newProvider);

        // Update provider and set appropriate API key
        let apiKey = '';
        if (newProvider === 'gemini') apiKey = localSettings.geminiApiKey || '';
        if (newProvider === 'openai') apiKey = localSettings.openaiApiKey || '';
        if (newProvider === 'anthropic') apiKey = localSettings.anthropicApiKey || '';

        setLocalSettings(prev => ({
            ...prev,
            provider: newProvider,
            aiModel: newModel,
            apiKey,
        }));
    };

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newApiKey = e.target.value;

        // Update both the general apiKey and the provider-specific key
        const updates: Partial<AppSettings> = { apiKey: newApiKey };
        if (localSettings.provider === 'gemini') updates.geminiApiKey = newApiKey;
        if (localSettings.provider === 'openai') updates.openaiApiKey = newApiKey;
        if (localSettings.provider === 'anthropic') updates.anthropicApiKey = newApiKey;

        setLocalSettings(prev => ({ ...prev, ...updates }));
    };

    const availableModels = getAvailableModels(localSettings.provider);

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Préférences de l'Application</h2>

            <form onSubmit={handleSave}>
                <div className="space-y-8">
                    {/* AI Settings Section */}
                    <div className="bg-gray-900 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-orange-400 mb-4">Configuration de l'IA</h3>

                        {/* Provider Selection */}
                        <div className="mb-6">
                            <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-2">
                                Fournisseur d'IA
                            </label>
                            <select
                                id="provider"
                                name="provider"
                                value={localSettings.provider}
                                onChange={handleProviderChange}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI GPT</option>
                                <option value="anthropic">Anthropic Claude</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Sélectionnez le fournisseur d'IA pour générer vos suggestions de commande.
                            </p>
                        </div>

                        {/* API Key */}
                        <div className="mb-6">
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                                Clé API {getProviderDisplayName(localSettings.provider)}
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                name="apiKey"
                                value={localSettings.apiKey}
                                onChange={handleApiKeyChange}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder={`Saisissez votre clé API ${getProviderDisplayName(localSettings.provider)}`}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {localSettings.provider === 'gemini' && 'Obtenez votre clé sur https://aistudio.google.com/apikey'}
                                {localSettings.provider === 'openai' && 'Obtenez votre clé sur https://platform.openai.com/api-keys'}
                                {localSettings.provider === 'anthropic' && 'Obtenez votre clé sur https://console.anthropic.com/settings/keys'}
                            </p>
                        </div>

                        {/* Model Selection */}
                        <div>
                            <label htmlFor="aiModel" className="block text-sm font-medium text-gray-300 mb-2">
                                Modèle d'IA pour les suggestions
                            </label>
                            <select
                                id="aiModel"
                                name="aiModel"
                                value={localSettings.aiModel}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {availableModels.map(model => (
                                    <option key={model} value={model}>
                                        {getModelDisplayName(model)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Choisissez le modèle d'IA qui générera les suggestions de commande. Les modèles "Mini/Flash/Haiku" sont plus rapides et économiques, tandis que les versions standard sont plus puissantes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                    <button
                        type="submit"
                        className={`font-bold py-2 px-6 rounded-lg transition-all flex items-center ${
                            saveStatus === 'saving'
                                ? 'bg-gray-600 cursor-not-allowed'
                                : saveStatus === 'saved'
                                ? 'bg-green-600'
                                : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' && 'Enregistrement...'}
                        {saveStatus === 'saved' && 'Enregistré !'}
                        {saveStatus === 'idle' && 'Enregistrer les Préférences'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PreferencesPage;