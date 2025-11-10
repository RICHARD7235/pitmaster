
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import Modal from './common/Modal';

interface ReceiveOrderModalProps {
    order: Order | null;
    onConfirm: (orderId: string, receivedItems: { productId: string, quantity: number }[]) => void;
    onClose: () => void;
}

const ReceiveOrderModal: React.FC<ReceiveOrderModalProps> = ({ order, onConfirm, onClose }) => {
    const [quantities, setQuantities] = useState<Record<string, string>>({});

    useEffect(() => {
        if (order) {
            const initialQuantities = order.items.reduce((acc, item) => {
                const remaining = item.quantity - item.receivedQuantity;
                acc[item.productId] = remaining > 0 ? remaining.toString() : '0';
                return acc;
            }, {} as Record<string, string>);
            setQuantities(initialQuantities);
        }
    }, [order]);

    if (!order) return null;

    const handleQuantityChange = (productId: string, value: string) => {
        const maxQuantity = order.items.find(i => i.productId === productId)!.quantity - order.items.find(i => i.productId === productId)!.receivedQuantity;
        if (parseFloat(value) > maxQuantity) {
             setQuantities(prev => ({ ...prev, [productId]: maxQuantity.toString() }));
        } else {
             setQuantities(prev => ({ ...prev, [productId]: value }));
        }
    };

    const handleSubmit = () => {
        const receivedItems = Object.entries(quantities)
            .map(([productId, quantityStr]) => ({
                productId,
                quantity: parseFloat(quantityStr) || 0,
            }))
            .filter(item => item.quantity > 0);
        
        onConfirm(order.id, receivedItems);
    };
    
    return (
        <Modal isOpen={!!order} onClose={onClose} title={`Réception de la commande #${order.id.split('-')[1]}`}>
            <p className="text-gray-400 mb-4">Saisissez les quantités réellement reçues pour chaque produit.</p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {order.items.map(item => {
                    const remainingToReceive = item.quantity - item.receivedQuantity;
                    return (
                        <div key={item.productId} className="grid grid-cols-3 items-center gap-4 p-2 bg-gray-900 rounded-md">
                            <div>
                                <p className="font-semibold">{item.productName}</p>
                                <p className="text-sm text-gray-400">Commandé: {item.quantity} {item.unit} | Déjà Reçu: {item.receivedQuantity} {item.unit}</p>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <label htmlFor={`qty-${item.productId}`} className="text-sm">Quantité reçue:</label>
                                <input
                                    id={`qty-${item.productId}`}
                                    type="number"
                                    min="0"
                                    max={remainingToReceive}
                                    value={quantities[item.productId] || ''}
                                    onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                                    className="w-24 bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={remainingToReceive <= 0}
                                />
                                <span className="text-gray-400">{item.unit}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
             <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-700">
                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Confirmer la Réception</button>
            </div>
        </Modal>
    );
};

export default ReceiveOrderModal;
