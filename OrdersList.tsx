import React, { useState, useMemo } from 'react';
import { Order, Role } from '../types';
import { Icons } from './common/Icons';

interface OrdersListProps {
    orders: Order[];
    role: Role;
    onStartReception: (orderId: string) => void;
    onCancelOrder: (orderId: string) => void;
    onSendOrder: (orderId: string) => void;
}

type FilterStatus = 'Tous' | 'Brouillons' | 'En cours' | 'Terminées';

const statusStyles: Record<Order['status'], string> = {
    Brouillon: 'bg-gray-500/20 text-gray-300',
    Envoyée: 'bg-blue-500/20 text-blue-300',
    Confirmée: 'bg-purple-500/20 text-purple-300',
    'Reçue partiellement': 'bg-yellow-500/20 text-yellow-300',
    'Reçue totalement': 'bg-green-500/20 text-green-300',
    Annulée: 'bg-red-500/20 text-red-400',
};

const OrdersList: React.FC<OrdersListProps> = ({ orders, role, onStartReception, onCancelOrder, onSendOrder }) => {
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('Tous');

    const canReceive = role === 'Gérant' || role === 'Chef' || role === 'Commis';
    const canCancel = role === 'Gérant';
    const canSend = role === 'Gérant' || role === 'Chef';

    const toggleExpand = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const filteredOrders = useMemo(() => {
        const sorted = orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (activeFilter === 'Tous') return sorted;
        if (activeFilter === 'Brouillons') return sorted.filter(o => o.status === 'Brouillon');
        if (activeFilter === 'En cours') return sorted.filter(o => ['Envoyée', 'Reçue partiellement', 'Confirmée'].includes(o.status));
        if (activeFilter === 'Terminées') return sorted.filter(o => ['Reçue totalement', 'Annulée'].includes(o.status));
        return sorted;
    }, [orders, activeFilter]);

    if (orders.length === 0) {
        return (
            <div className="text-center bg-gray-800 p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white">Aucune commande passée</h2>
                <p className="text-gray-400 mt-2">Les commandes que vous envoyez apparaîtront ici.</p>
            </div>
        );
    }

    const FilterButton: React.FC<{ label: FilterStatus }> = ({ label }) => (
        <button 
            onClick={() => setActiveFilter(label)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === label ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white">Suivi des Commandes</h2>
                <div className="flex items-center gap-2">
                    <FilterButton label="Tous" />
                    <FilterButton label="Brouillons" />
                    <FilterButton label="En cours" />
                    <FilterButton label="Terminées" />
                </div>
            </div>
            <div className="space-y-3">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-gray-900 rounded-lg">
                        <div onClick={() => toggleExpand(order.id)} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-4">
                            <div>
                                <span className="font-bold text-white">{order.supplierName}</span>
                                <span className="text-sm text-gray-400 ml-0 sm:ml-4 block sm:inline">{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4 self-end sm:self-center">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyles[order.status]}`}>{order.status}</span>
                                <span className="font-mono text-white w-24 text-right">{order.total.toFixed(2)} €</span>
                                <div className="flex items-center gap-2">
                                    {order.status === 'Brouillon' && canSend && (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); onSendOrder(order.id); }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-1 px-3 rounded-lg flex items-center"
                                        >
                                            <Icons name="send" className="h-4 w-4 mr-1"/>
                                            Envoyer
                                        </button>
                                    )}
                                    {(order.status === 'Envoyée' || order.status === 'Reçue partiellement') && canReceive && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onStartReception(order.id); }}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-1 px-3 rounded-lg"
                                        >
                                            Réceptionner
                                        </button>
                                    )}
                                    {(order.status === 'Envoyée' || order.status === 'Brouillon') && canCancel && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onCancelOrder(order.id); }}
                                            className="text-red-400 hover:text-red-300 p-1"
                                            title="Annuler la commande"
                                        >
                                            <Icons name="trash" className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {expandedOrder === order.id && (
                             <div className="px-4 pb-4 border-t border-gray-700">
                                <ul className="mt-2 space-y-1">
                                    {order.items.map(item => (
                                        <li key={item.productId} className="text-gray-300 text-sm">
                                            <span className="font-semibold">{item.productName}:</span> {item.quantity} {item.unit} commandés
                                            <span className="italic text-gray-400 ml-2">({item.receivedQuantity} reçus)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersList;