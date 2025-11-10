
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './common/Modal';

interface EditProductModalProps {
    product: Product | 'new' | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'currentStock'>>({ name: '', family: '', unit: '', minStock: 0, averageCost: 0 });
    const isNew = product === 'new';

    useEffect(() => {
        if (product && product !== 'new') {
            setFormData(product);
        } else {
            setFormData({ name: '', family: '', unit: '', minStock: 0, averageCost: 0 });
        }
    }, [product]);

    if (!product) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['minStock', 'averageCost'];
        setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productToSave = isNew 
            ? { ...formData, id: '', currentStock: 0 } 
            : { ...formData, id: (product as Product).id, currentStock: (product as Product).currentStock };
        onSave(productToSave);
    };

    return (
        <Modal isOpen={!!product} onClose={onClose} title={isNew ? "Ajouter un Produit" : "Modifier le Produit"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom du Produit</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="family" className="block text-sm font-medium text-gray-300 mb-1">Famille</label>
                        <input type="text" name="family" id="family" value={formData.family} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                    </div>
                     <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-1">Unité</label>
                        <input type="text" name="unit" id="unit" value={formData.unit} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" placeholder="ex: kg, L, Pièce"/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="averageCost" className="block text-sm font-medium text-gray-300 mb-1">Coût Moyen (€)</label>
                        <input type="number" step="0.01" name="averageCost" id="averageCost" value={formData.averageCost} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                    </div>
                    <div>
                        <label htmlFor="minStock" className="block text-sm font-medium text-gray-300 mb-1">Stock Minimum</label>
                        <input type="number" name="minStock" id="minStock" value={formData.minStock} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Enregistrer</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProductModal;