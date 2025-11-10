
import React from 'react';
import { User } from '../types';
import { Icons } from './common/Icons';

interface UserManagementProps {
    users: User[];
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onAddUser: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onEditUser, onDeleteUser, onAddUser }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Gestion des Utilisateurs</h3>
                <button
                    onClick={onAddUser}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                    <Icons name="plus" className="h-5 w-5 mr-2" />
                    Ajouter un Utilisateur
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-600">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Nom</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Rôle</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 font-medium text-white">{user.name}</td>
                                <td className="p-4 text-gray-400">{user.email}</td>
                                <td className="p-4 text-orange-400 font-semibold">{user.role}</td>
                                <td className="p-4 flex gap-4">
                                    <button onClick={() => onEditUser(user)} className="text-blue-400 hover:text-blue-300" title="Modifier">
                                        <Icons name="edit" className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onDeleteUser(user.id)} className="text-red-400 hover:text-red-300" title="Supprimer">
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

export default UserManagement;
