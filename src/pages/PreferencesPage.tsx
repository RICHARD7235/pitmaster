
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';

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

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Préférences de l'Application</h2>

            <form onSubmit={handleSave}>
                <div className="space-y-8">
                    {/* AI Settings Section */}
                    <div className="bg-gray-900 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-orange-400 mb-4">Configuration de l'IA</h3>
                        
                        <div className="mb-4">
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                                Clé API Gemini
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                name="apiKey"
                                value={localSettings.apiKey}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Saisissez votre clé API"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Votre clé API est utilisée pour communiquer avec les services d'IA de Google. Elle est gérée de manière sécurisée et ne sera pas exposée. Pour la démonstration, la clé configurée dans l'environnement est utilisée.
                            </p>
                        </div>

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
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Rapide et économique)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Plus puissant)</option>
                            </select>
                             <p className="text-xs text-gray-500 mt-2">
                                Choisissez le modèle d'IA qui générera les suggestions de commande. 'Flash' est idéal pour les tâches quotidiennes, tandis que 'Pro' peut offrir des analyses plus approfondies.
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