
import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import Modal from '../common/Modal';

interface EditUserModalProps {
    user: User | 'new' | null;
    onClose: () => void;
    onSave: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'Commis' });
    const isNew = user === 'new';
    
    useEffect(() => {
        if (user && user !== 'new') {
            setFormData(user);
        } else {
            setFormData({ name: '', email: '', role: 'Commis' });
        }
    }, [user]);

    if (!user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave = isNew ? { ...formData } : { ...formData, id: (user as User).id };
        onSave(userToSave as User);
    };

    return (
        <Modal isOpen={!!user} onClose={onClose} title={isNew ? "Ajouter un Utilisateur" : "Modifier l'Utilisateur"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom Complet</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3" />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Rôle</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3">
                        <option value="Gérant">Gérant</option>
                        <option value="Chef">Chef</option>
                        <option value="Commis">Commis</option>
                    </select>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Enregistrer</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
