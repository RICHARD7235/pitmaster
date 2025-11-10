
import React, { useState, useCallback } from 'react';
import { Product } from '../../types';
import Modal from '../common/Modal';
import { Icons } from '../common/Icons';

interface ImportStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (fileName: string, stockUpdates: { productName: string, newStock: number }[]) => void;
    products: Product[];
}

interface StockUpdatePreview {
    productName: string;
    oldStock: number;
    newStock: number;
    unit: string;
}

const ImportStockModal: React.FC<ImportStockModalProps> = ({ isOpen, onClose, onConfirm, products }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<StockUpdatePreview[]>([]);

    const resetState = useCallback(() => {
        setFileName(null);
        setError(null);
        setPreview([]);
    }, []);

    const handleFileSelect = (file: File | null) => {
        resetState();
        if (!file) return;

        if (!/\.(csv|xlsx)$/i.test(file.name)) {
            setError("Format de fichier invalide. Veuillez sélectionner un fichier .csv ou .xlsx.");
            return;
        }

        setFileName(file.name);
        
        // --- SIMULATION OF FILE PARSING ---
        // In a real app, you would use a library like SheetJS (for xlsx) or PapaParse (for csv)
        // For this simulation, we generate random updates for a subset of products.
        const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
        const productsToUpdate = shuffledProducts.slice(0, Math.min(5, shuffledProducts.length));

        const newPreview = productsToUpdate.map(p => ({
            productName: p.name,
            oldStock: p.currentStock,
            newStock: Math.floor(Math.random() * (p.minStock * 3)), // New stock up to 3x minStock
            unit: p.unit,
        }));
        setPreview(newPreview);
    };

    const handleConfirm = () => {
        if (!fileName || preview.length === 0) return;
        const stockUpdates = preview.map(p => ({
            productName: p.productName,
            newStock: p.newStock,
        }));
        onConfirm(fileName, stockUpdates);
        resetState();
    };
    
    const handleClose = () => {
        onClose();
        setTimeout(resetState, 300); // Reset after modal close animation
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importer un Inventaire Stock">
            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-900/50">
                    <Icons name="upload" className="h-10 w-10 mx-auto text-gray-500 mb-2" />
                    <label htmlFor="file-upload" className="font-semibold text-orange-400 cursor-pointer hover:text-orange-300">
                        Cliquez pour sélectionner un fichier
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} accept=".csv,.xlsx" />
                    {fileName && <p className="text-sm text-gray-400 mt-2">Fichier sélectionné : {fileName}</p>}
                </div>

                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}

                {preview.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2 text-white">Aperçu des changements</h4>
                        <div className="bg-gray-900 p-2 rounded-md max-h-60 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="p-2 font-semibold">Produit</th>
                                        <th className="p-2 font-semibold text-right">Stock Actuel</th>
                                        <th className="p-2 font-semibold text-right">Nouveau Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((item, index) => (
                                        <tr key={index} className="border-t border-gray-700">
                                            <td className="p-2">{item.productName}</td>
                                            <td className="p-2 font-mono text-right text-gray-400">{item.oldStock} {item.unit}</td>
                                            <td className="p-2 font-mono text-right text-orange-400">{item.newStock} {item.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button onClick={handleClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button 
                        onClick={handleConfirm} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        // Fix: Ensure the expression for 'disabled' always evaluates to a boolean.
                        // The 'error' variable is a string|null, which could result in a string being passed.
                        // Coercing 'error' to a boolean with `!!` solves the type error.
                        disabled={!fileName || !!error || preview.length === 0}
                    >
                        Confirmer et Mettre à Jour
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportStockModal;
