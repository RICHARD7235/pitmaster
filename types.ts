export interface Product {
    id: string;
    name: string;
    family: string;
    unit: string;
    currentStock: number;
    minStock: number;
    averageCost: number;
}

export interface SupplierProduct {
    internalProductId: string;
    supplierSku: string;
    price: number;
}

export interface Supplier {
    id: string;
    name: string;
    deliveryDays: string;
    minOrder: number;
    products: SupplierProduct[];
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    receivedQuantity: number;
    unit: string;
    pricePerUnit: number;
}

export interface Order {
    id: string;
    supplierId: string;
    supplierName: string;
    date: string;
    status: 'Brouillon' | 'Envoyée' | 'Confirmée' | 'Reçue partiellement' | 'Reçue totalement' | 'Annulée';
    items: OrderItem[];
    total: number;
}

export interface ShoppingCartItem {
    productId: string;
    supplierId: string;
    quantity: number;
}

export interface AISuggestion extends ShoppingCartItem {
    reasoning: string;
}

export type View = 'dashboard' | 'stock' | 'suppliers' | 'suggestions' | 'cart' | 'orders' | 'administration';

export type Role = 'Gérant' | 'Chef' | 'Commis';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

// Added for sales import feature
export interface SaleItem {
    productName: string;
    quantitySold: number;
}

// Added for app preferences page
export interface AppSettings {
    apiKey: string;
    aiModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

// Added for stock import feature
export interface StockImportRecord {
    id: string;
    date: string;
    fileName: string;
    productsUpdated: number;
}
