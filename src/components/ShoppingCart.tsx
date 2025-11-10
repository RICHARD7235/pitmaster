
import React, { useMemo } from 'react';
import { ShoppingCartItem, Product, Supplier, Role } from '../types';
import { Icons } from './common/Icons';

interface ShoppingCartProps {
    cartItems: ShoppingCartItem[];
    products: Product[];
    suppliers: Supplier[];
    onUpdateQuantity: (productId: string, supplierId: string, newQuantity: number) => void;
    onPlaceOrder: () => void;
    role: Role;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ cartItems, products, suppliers, onUpdateQuantity, onPlaceOrder, role }) => {
    
    const canPlaceOrder = role === 'Gérant' || role === 'Chef';

    type SupplierOrder = {
        supplierName: string;
        minOrder: number;
        items: (ShoppingCartItem & { product: Product; price: number })[];
        total: number;
    };

    const ordersBySupplier = useMemo(() => {
        const initialOrders: Record<string, SupplierOrder> = {};

        return cartItems.reduce((acc, item) => {
            if (!acc[item.supplierId]) {
                const supplier = suppliers.find(s => s.id === item.supplierId);
                acc[item.supplierId] = {
                    supplierName: supplier?.name || 'Inconnu',
                    minOrder: supplier?.minOrder || 0,
                    items: [],
                    total: 0,
                };
            }

            const product = products.find(p => p.id === item.productId);
            const supplier = suppliers.find(s => s.id === item.supplierId);
            const supplierProduct = supplier?.products.find(sp => sp.internalProductId === item.productId);

            if (product && supplierProduct) {
                const itemTotal = item.quantity * supplierProduct.price;
                acc[item.supplierId].items.push({ ...item, product, price: supplierProduct.price });
                acc[item.supplierId].total += itemTotal;
            }
            return acc;
        }, initialOrders);
    }, [cartItems, products, suppliers]);

    if (cartItems.length === 0) {
        return (
            <div className="text-center bg-gray-800 p-10 rounded-xl shadow-lg">
                <Icons name="cart" className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Votre panier est vide</h2>
                <p className="text-gray-400 mt-2">Ajoutez des produits depuis les suggestions pour commencer une commande.</p>
            </div>
        );
    }
    
    const totalCartValue = Object.values(ordersBySupplier).reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Panier de Commande</h2>
            
            <div className="space-y-6">
                {Object.entries(ordersBySupplier).map(([supplierId, order]) => (
                    <div key={supplierId} className="bg-gray-900 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-orange-400 mb-2">{order.supplierName}</h3>
                        {order.items.map(item => (
                             <div key={item.productId} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                <span className="flex-1">{item.product.name}</span>
                                <div className="flex items-center gap-2">
                                     <input 
                                        type="number" 
                                        value={item.quantity}
                                        onChange={(e) => onUpdateQuantity(item.productId, item.supplierId, parseInt(e.target.value, 10) || 0)}
                                        className="w-20 bg-gray-700 text-white text-center rounded-md border border-gray-600"
                                    />
                                    <span className="w-16 text-right font-mono">{(item.quantity * item.price).toFixed(2)} €</span>
                                    <button onClick={() => onUpdateQuantity(item.productId, item.supplierId, 0)} className="text-red-400 hover:text-red-300">
                                        <Icons name="trash" className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                         <div className="text-right mt-2 font-bold">
                             Total: {order.total.toFixed(2)} €
                             {order.total < order.minOrder && <span className="ml-2 text-xs text-yellow-400">(Min. {order.minOrder}€)</span>}
                         </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-700 flex justify-between items-center">
                 <div className="text-xl font-bold">Total Général: {totalCartValue.toFixed(2)} €</div>
                 <button 
                    onClick={onPlaceOrder} 
                    className={`font-bold py-3 px-6 rounded-lg transition-transform transform ${
                        canPlaceOrder 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!canPlaceOrder}
                    title={!canPlaceOrder ? "Vous n'avez pas la permission de passer des commandes." : ""}
                >
                     Générer & Envoyer les Commandes
                 </button>
            </div>
        </div>
    );
};

export default ShoppingCart;
