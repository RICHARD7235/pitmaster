
import React, { useState } from 'react';
import { Product, Role } from '../types';
import { Icons } from './common/Icons';

interface StockListProps {
    products: Product[];
    onUpdateStock: (productId: string, newStock: number) => void;
    role: Role;
    onImportSalesClick: () => void;
}

const StockList: React.FC<StockListProps> = ({ products, onUpdateStock, role, onImportSalesClick }) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newStockValue, setNewStockValue] = useState<string>('');
    const canEdit = role === 'Gérant' || role === 'Commis';
    const canImportSales = role === 'Gérant' || role === 'Chef' || role === 'Commis';

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setNewStockValue(product.currentStock.toString());
    };
    
    const handleSave = () => {
        if (editingProduct && newStockValue !== '') {
            const newStock = parseFloat(newStockValue);
            if (!isNaN(newStock)) {
                onUpdateStock(editingProduct.id, newStock);
            }
            setEditingProduct(null);
            setNewStockValue('');
        }
    };
    
    const handleCancel = () => {
        setEditingProduct(null);
        setNewStockValue('');
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Gestion des Stocks</h2>
                 {canImportSales && (
                     <button onClick={onImportSalesClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105">
                        <Icons name="trending-down" className="h-5 w-5 mr-2" />
                        Importer Ventes (Sortie de Stock)
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-600">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Produit</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Famille</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Stock Actuel</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Stock Min.</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Statut</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const isLowStock = product.currentStock < product.minStock;
                            return (
                                <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-white">{product.name}</td>
                                    <td className="p-4 text-gray-400">{product.family}</td>
                                    <td className="p-4 font-mono text-white">{product.currentStock} {product.unit}</td>
                                    <td className="p-4 font-mono text-gray-400">{product.minStock} {product.unit}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                            {isLowStock ? 'Alerte' : 'OK'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {canEdit && (
                                            <button onClick={() => handleEditClick(product)} className="text-blue-400 hover:text-blue-300">
                                                <Icons name="edit" className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">Mettre à jour le stock pour "{editingProduct.name}"</h3>
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="stock">
                                Nouveau stock ({editingProduct.unit})
                            </label>
                            <input
                                id="stock"
                                type="number"
                                value={newStockValue}
                                onChange={(e) => setNewStockValue(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                            <button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockList;
