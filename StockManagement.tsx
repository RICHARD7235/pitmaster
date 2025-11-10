import React from 'react';
import { StockImportRecord } from '../types';
import { Icons } from './common/Icons';

interface StockManagementProps {
    history: StockImportRecord[];
    onNewImport: () => void;
}

const StockManagement: React.FC<StockManagementProps> = ({ history, onNewImport }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Historique des Inventaires</h3>
                <button
                    onClick={onNewImport}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                    <Icons name="upload" className="h-5 w-5 mr-2" />
                    Nouvel Inventaire
                </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
                Importez un fichier d'inventaire pour rectifier les niveaux de stock de tous vos produits en une seule opération.
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-600">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Fichier</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Produits Mis à Jour</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center p-8 text-gray-500">
                                    Aucun historique d'inventaire trouvé.
                                </td>
                            </tr>
                        ) : (
                            history.map(record => (
                                <tr key={record.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-white">{new Date(record.date).toLocaleString()}</td>
                                    <td className="p-4 text-gray-400">{record.fileName}</td>
                                    <td className="p-4 text-center font-mono text-white">{record.productsUpdated}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockManagement;
