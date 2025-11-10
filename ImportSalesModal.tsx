
import React from 'react';
import Modal from './common/Modal';
import { Icons } from './common/Icons';
import { SaleItem } from '../types';

interface ImportSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (sales: SaleItem[]) => void;
}

// Mock data to simulate what would be extracted from an Excel/CSV file
const MOCK_SALES_DATA: SaleItem[] = [
    { productName: 'Saumon Frais Label Rouge', quantitySold: 2.5 },
    { productName: 'Côte de Boeuf', quantitySold: 4 },
    { productName: 'Huile d\'olive vierge extra', quantitySold: 1 },
];

const ImportSalesModal: React.FC<ImportSalesModalProps> = ({ isOpen, onClose, onConfirm }) => {
    
    const handleConfirm = () => {
        onConfirm(MOCK_SALES_DATA);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importer les Ventes (Sortie de Stock)">
            <div className="space-y-6">
                 <div className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center">
                    <Icons name="upload" className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="font-semibold">Glissez-déposez le récapitulatif des ventes ici</p>
                    <p className="text-sm text-gray-400">ou cliquez pour sélectionner un fichier (simulation)</p>
                </div>

                <div>
                    <h4 className="font-semibold mb-2 text-orange-400">Aperçu des données importées (Exemple)</h4>
                    <div className="bg-gray-900 p-4 rounded-md max-h-48 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="p-2 text-sm font-semibold text-gray-300">Produit Vendu</th>
                                    <th className="p-2 text-sm font-semibold text-gray-300 text-right">Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_SALES_DATA.map((sale, index) => (
                                    <tr key={index} className="border-t border-gray-700">
                                        <td className="p-2">{sale.productName}</td>
                                        <td className="p-2 font-mono text-right">{sale.quantitySold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <p className="text-xs text-gray-500 mt-2">Ceci est une simulation. En production, le système mapperait les articles vendus aux produits de votre stock.</p>
                </div>
                 <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                       <Icons name="trending-down" className="h-5 w-5 mr-2" />
                        Mettre à jour les stocks
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportSalesModal;
