
import React, { useState, useEffect, useCallback } from 'react';
import { Product, Supplier, AISuggestion, ShoppingCartItem, View } from '../types';
import { generateOrderSuggestions } from '../services/geminiService';
import { Icons } from './common/Icons';

interface OrderSuggestionsProps {
    lowStockProducts: Product[];
    suppliers: Supplier[];
    addToCart: (item: ShoppingCartItem) => void;
    onNavigate: (view: View) => void;
    aiModel: string; // Add aiModel prop
}

const OrderSuggestions: React.FC<OrderSuggestionsProps> = ({ lowStockProducts, suppliers, addToCart, onNavigate, aiModel }) => {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async () => {
        if (lowStockProducts.length > 0) {
            setIsLoading(true);
            setError(null);
            try {
                // Pass the selected AI model to the service
                const result = await generateOrderSuggestions(lowStockProducts, suppliers, aiModel);
                setSuggestions(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    }, [lowStockProducts, suppliers, aiModel]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const getProductDetails = (id: string) => products.find(p => p.id === id);
    const getSupplierDetails = (id: string) => suppliers.find(s => s.id === id);
    const products = lowStockProducts;

    const handleAddToCart = (suggestion: AISuggestion) => {
        addToCart({
            productId: suggestion.productId,
            supplierId: suggestion.supplierId,
            quantity: suggestion.quantity,
        });
        // Optimistically remove from suggestions list
        setSuggestions(prev => prev.filter(s => s.productId !== suggestion.productId));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800 p-6 rounded-xl shadow-lg">
                <Icons name="spinner" className="h-16 w-16 text-orange-500 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-white">L'agent intelligent analyse les besoins...</h2>
                <p className="text-gray-400 mt-2">Comparaison des fournisseurs et optimisation des quantités en cours.</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-2">Erreur de l'Agent IA</h2>
                <p>{error}</p>
                <button onClick={fetchSuggestions} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Réessayer</button>
            </div>
        );
    }

    if (lowStockProducts.length === 0) {
        return (
             <div className="text-center bg-gray-800 p-10 rounded-xl shadow-lg">
                <Icons name="box" className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Tout est en ordre !</h2>
                <p className="text-gray-400 mt-2">Aucun produit n'est en dessous du seuil de stock minimum.</p>
             </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Alertes et Suggestions d'Achat</h2>
            {suggestions.length === 0 && !isLoading && (
                 <div className="text-center bg-gray-800 p-10 rounded-xl shadow-lg">
                     <p className="text-gray-400">Aucune suggestion générée pour le moment. Cliquez pour analyser.</p>
                     <button onClick={fetchSuggestions} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Analyser les besoins</button>
                 </div>
            )}
            <div className="space-y-4">
                {suggestions.map((suggestion) => {
                    const product = getProductDetails(suggestion.productId);
                    const supplier = getSupplierDetails(suggestion.supplierId);
                    if (!product || !supplier) return null;

                    return (
                        <div key={`${suggestion.productId}-${suggestion.supplierId}`} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white">{product.name}</h3>
                                <p className="text-sm text-gray-400">
                                    Stock: <span className="text-red-400 font-semibold">{product.currentStock} {product.unit}</span> (Min: {product.minStock} {product.unit})
                                </p>
                                <p className="text-sm text-orange-400 mt-2 bg-gray-900 p-2 rounded">{suggestion.reasoning}</p>
                            </div>
                            <div className="w-full md:w-auto bg-gray-900 p-4 rounded-md">
                                <p className="font-semibold text-white">Suggestion : Commander {suggestion.quantity} {product.unit}</p>
                                <p className="text-sm text-gray-300">Auprès de : <span className="font-bold">{supplier.name}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAddToCart(suggestion)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                    <Icons name="plus" className="h-5 w-5 mr-1" />
                                    Ajouter
                                </button>
                                <button onClick={() => onNavigate('cart')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                    <Icons name="cart" className="h-5 w-5 mr-1" />
                                    Voir Panier
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderSuggestions;