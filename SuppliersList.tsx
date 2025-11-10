
import React, { useState } from 'react';
import { Supplier, Product, Role } from '../types';
import { Icons } from './common/Icons';

interface SuppliersListProps {
    suppliers: Supplier[];
    products: Product[];
    role: Role;
    onImportClick: () => void;
}

const SuppliersList: React.FC<SuppliersListProps> = ({ suppliers, products, role, onImportClick }) => {
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Produit inconnu';
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Fournisseurs</h2>
                {role === 'Gérant' && (
                     <button onClick={onImportClick} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105">
                        <Icons name="upload" className="h-5 w-5 mr-2" />
                        Importer un Catalogue
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                    <div key={supplier.id} onClick={() => setSelectedSupplier(supplier)} className="bg-gray-700 p-5 rounded-lg shadow-md hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                        <h3 className="text-lg font-bold text-orange-400">{supplier.name}</h3>
                        <p className="text-sm text-gray-300">Jours de livraison: {supplier.deliveryDays}</p>
                        <p className="text-sm text-gray-300">Min. commande: {supplier.minOrder > 0 ? `${supplier.minOrder} €` : 'Aucun'}</p>
                        <p className="text-sm text-gray-300 mt-2">{supplier.products.length} produits référencés</p>
                    </div>
                ))}
            </div>

            {selectedSupplier && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelectedSupplier(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                             <h3 className="text-2xl font-bold mb-4 text-white">{selectedSupplier.name}</h3>
                             <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-white p-1 rounded-full -mt-2 -mr-2"><Icons name="close" className="h-6 w-6"/></button>
                        </div>
                       
                        <h4 className="text-lg font-semibold text-orange-400 mt-4 mb-2">Catalogue Produits</h4>
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-600">
                                    <tr>
                                        <th className="p-2 text-sm font-semibold text-gray-300">Produit</th>
                                        <th className="p-2 text-sm font-semibold text-gray-300">SKU Fournisseur</th>
                                        <th className="p-2 text-sm font-semibold text-gray-300">Prix</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSupplier.products.map(sp => (
                                        <tr key={sp.supplierSku} className="border-b border-gray-700">
                                            <td className="p-2">{getProductName(sp.internalProductId)}</td>
                                            <td className="p-2 text-gray-400">{sp.supplierSku}</td>
                                            <td className="p-2 font-mono">{sp.price.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersList;
