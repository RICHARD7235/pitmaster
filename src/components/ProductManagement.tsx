
import React from 'react';
import { Product } from '../types';
import { Icons } from './common/Icons';

interface ProductManagementProps {
    products: Product[];
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onAddProduct: () => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onEditProduct, onDeleteProduct, onAddProduct }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Catalogue des Produits</h3>
                <button
                    onClick={onAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                    <Icons name="plus" className="h-5 w-5 mr-2" />
                    Ajouter un Produit
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-600">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Nom</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Famille</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Unité</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Coût Moyen</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Stock Min.</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 font-medium text-white">{product.name}</td>
                                <td className="p-4 text-gray-400">{product.family}</td>
                                <td className="p-4 text-gray-400">{product.unit}</td>
                                <td className="p-4 font-mono text-white">{product.averageCost.toFixed(2)} €</td>
                                <td className="p-4 font-mono text-gray-400">{product.minStock}</td>
                                <td className="p-4 flex gap-4">
                                    <button onClick={() => onEditProduct(product)} className="text-blue-400 hover:text-blue-300" title="Modifier">
                                        <Icons name="edit" className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onDeleteProduct(product.id)} className="text-red-400 hover:text-red-300" title="Supprimer">
                                        <Icons name="trash" className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductManagement;