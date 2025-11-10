import React, { useState, useEffect } from 'react';
import { Supplier, SupplierProduct, Product } from '../types';
import Modal from './common/Modal';
import { Icons } from './common/Icons';

interface EditSupplierModalProps {
    supplier: Supplier | 'new' | null;
    products: Product[];
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({ supplier, products, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({ name: '', deliveryDays: '', minOrder: 0, products: [] });
    const isNew = supplier === 'new';

    useEffect(() => {
        if (supplier && supplier !== 'new') {
            setFormData(supplier);
        } else {
            setFormData({ name: '', deliveryDays: '', minOrder: 0, products: [] });
        }
    }, [supplier]);

    if (!supplier) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'minOrder' ? parseFloat(value) : value }));
    };

    const handleProductMappingChange = (index: number, field: keyof SupplierProduct, value: string | number) => {
        const newProducts = [...formData.products];
        (newProducts[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, products: newProducts }));
    };
    
    const addProductMapping = () => {
        const firstAvailableProduct = products.find(p => !formData.products.some(sp => sp.internalProductId === p.id));
        if (firstAvailableProduct) {
            setFormData(prev => ({
                ...prev,
                products: [
                    ...prev.products,
                    { internalProductId: firstAvailableProduct.id, supplierSku: '', price: 0 }
                ]
            }));
        } else {
            alert("Tous les produits sont déjà mappés pour ce fournisseur.");
        }
    };

    const removeProductMapping = (index: number) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const supplierToSave = isNew 
            ? { ...formData } 
            : { ...formData, id: (supplier as Supplier).id };
        onSave(supplierToSave as Supplier);
    };
    
    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';
    const availableProductsForMapping = products.filter(p => !formData.products.some(sp => sp.internalProductId === p.id));


    return (
        <Modal isOpen={!!supplier} onClose={onClose} title={isNew ? "Ajouter un Fournisseur" : "Modifier le Fournisseur"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom du Fournisseur</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                    </div>
                    <div>
                        <label htmlFor="deliveryDays" className="block text-sm font-medium text-gray-300 mb-1">Jours de Livraison</label>
                        <input type="text" name="deliveryDays" id="deliveryDays" value={formData.deliveryDays} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" placeholder="ex: Lundi, Jeudi"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="minOrder" className="block text-sm font-medium text-gray-300 mb-1">Minimum de Commande (€)</label>
                    <input type="number" step="0.01" name="minOrder" id="minOrder" value={formData.minOrder} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                </div>
                
                {/* Product Mapping */}
                <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-orange-400 mb-2">Catalogue Fournisseur</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {formData.products.map((p, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-900/50 p-2 rounded-md">
                               <div className="col-span-4">
                                    <select
                                        value={p.internalProductId}
                                        onChange={(e) => handleProductMappingChange(index, 'internalProductId', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-2 text-sm"
                                    >
                                        <option value={p.internalProductId}>{getProductName(p.internalProductId)}</option>
                                        {availableProductsForMapping.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        placeholder="SKU Fournisseur"
                                        value={p.supplierSku}
                                        onChange={(e) => handleProductMappingChange(index, 'supplierSku', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-2 text-sm"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Prix"
                                        value={p.price}
                                        onChange={(e) => handleProductMappingChange(index, 'price', parseFloat(e.target.value))}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-2 text-sm"
                                    />
                                </div>
                                <div className="col-span-1 text-right">
                                     <button type="button" onClick={() => removeProductMapping(index)} className="text-red-400 hover:text-red-300">
                                        <Icons name="trash" className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addProductMapping} className="mt-2 text-sm text-green-400 hover:text-green-300 font-semibold flex items-center">
                       <Icons name="plus" className="h-4 w-4 mr-1" />
                        Ajouter un produit au catalogue
                    </button>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Enregistrer</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditSupplierModal;