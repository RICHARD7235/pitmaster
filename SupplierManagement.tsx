import React from 'react';
import { Supplier } from '../types';
import { Icons } from './common/Icons';

interface SupplierManagementProps {
    suppliers: Supplier[];
    onEditSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (supplierId: string) => void;
    onAddSupplier: () => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, onEditSupplier, onDeleteSupplier, onAddSupplier }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Liste des Fournisseurs</h3>
                <button
                    onClick={onAddSupplier}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                    <Icons name="plus" className="h-5 w-5 mr-2" />
                    Ajouter un Fournisseur
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-600">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Nom</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Jours de Livraison</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Min. Commande</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Produits Mappés</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(supplier => (
                            <tr key={supplier.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 font-medium text-white">{supplier.name}</td>
                                <td className="p-4 text-gray-400">{supplier.deliveryDays}</td>
                                <td className="p-4 font-mono text-gray-400">{supplier.minOrder > 0 ? `${supplier.minOrder} €` : 'Aucun'}</td>
                                <td className="p-4 text-center font-mono text-white">{supplier.products.length}</td>
                                <td className="p-4 flex gap-4">
                                    <button onClick={() => onEditSupplier(supplier)} className="text-blue-400 hover:text-blue-300" title="Modifier">
                                        <Icons name="edit" className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onDeleteSupplier(supplier.id)} className="text-red-400 hover:text-red-300" title="Supprimer">
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

export default SupplierManagement;