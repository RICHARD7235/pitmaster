
import React, { useMemo } from 'react';
import { View, Order, Supplier, Product } from '../types';
// Fix: Import IconName type to correctly type the icon prop
import { Icons, type IconName } from './common/Icons';

interface DashboardProps {
    lowStockCount: number;
    onNavigate: (view: View) => void;
    orders: Order[];
    suppliers: Supplier[];
    products: Product[];
}

// Fix: Use IconName for the icon prop to ensure type safety
const StatCard: React.FC<{ title: string; value: string | number; icon: IconName; color: string; onClick?: () => void; }> = ({ title, value, icon, color, onClick }) => (
    <div
        className={`bg-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-4 rounded-full bg-gray-900`}>
            <Icons name={icon} className={`h-8 w-8 ${color}`} />
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ lowStockCount, onNavigate, orders, suppliers, products }) => {
    const activeOrdersCount = useMemo(() => {
        return orders.filter(o => o.status !== 'Reçue totalement' && o.status !== 'Annulée').length;
    }, [orders]);

    const activeSuppliersCount = suppliers.length;

    const totalSpendingMonth = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders
            .filter(o => new Date(o.date) >= firstDayOfMonth && o.status !== 'Annulée')
            .reduce((sum, order) => sum + order.total, 0);
    }, [orders]);

    const totalStockValue = useMemo(() => {
        return products.reduce((sum, product) => {
            return sum + (product.currentStock * product.averageCost);
        }, 0);
    }, [products]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Tableau de bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Produits en alerte de stock" 
                    value={lowStockCount} 
                    icon="bulb" 
                    color={lowStockCount > 0 ? "text-red-500" : "text-green-500"}
                    onClick={() => onNavigate('suggestions')}
                />
                <StatCard 
                    title="Commandes en cours" 
                    value={activeOrdersCount} 
                    icon="receipt"
                    color="text-blue-500"
                    onClick={() => onNavigate('orders')}
                />
                <StatCard 
                    title="Fournisseurs actifs" 
                    value={activeSuppliersCount} 
                    icon="truck"
                    color="text-purple-500"
                    onClick={() => onNavigate('suppliers')}
                />
            </div>
            
            <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Accès Rapide</h3>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => onNavigate('stock')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-transform transform hover:scale-105">
                        <Icons name="box" className="h-5 w-5 mr-2" />
                        Voir l'inventaire
                    </button>
                    <button onClick={() => onNavigate('suggestions')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-transform transform hover:scale-105">
                        <Icons name="bulb" className="h-5 w-5 mr-2" />
                        Générer des suggestions
                    </button>
                </div>
            </div>

             <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">Aperçu Financier</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        title="Dépenses (ce mois-ci)"
                        value={`${totalSpendingMonth.toFixed(2)} €`}
                        icon="cash"
                        color="text-green-400"
                    />
                    <StatCard
                        title="Valeur Totale du Stock"
                        value={`${totalStockValue.toFixed(2)} €`}
                        icon="archive"
                        color="text-yellow-400"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;