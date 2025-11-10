import { Product, Supplier, User, AppSettings, Order, ShoppingCartItem, OrderItem, SaleItem, StockImportRecord } from '../types';
import { MOCK_PRODUCTS, MOCK_SUPPLIERS, MOCK_USERS } from '../data/mockData';

// --- SIMULATED DATABASE ---
let products: Product[] = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
let suppliers: Supplier[] = JSON.parse(JSON.stringify(MOCK_SUPPLIERS));
let users: User[] = JSON.parse(JSON.stringify(MOCK_USERS));
let orders: Order[] = [];
let stockImportHistory: StockImportRecord[] = [
    { id: 'si1', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), fileName: 'inventaire_hebdo.xlsx', productsUpdated: 25 },
];
let appSettings: AppSettings = {
    provider: 'gemini',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    aiModel: 'gemini-2.5-flash',
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API FUNCTIONS ---

// Products
export const getProducts = async (): Promise<Product[]> => {
    await simulateDelay(300);
    return JSON.parse(JSON.stringify(products));
};

export const saveProduct = async (product: Product): Promise<Product> => {
    await simulateDelay(200);
    if (product.id) {
        products = products.map(p => p.id === product.id ? product : p);
        return product;
    } else {
        const newProduct = { ...product, id: `p${Date.now()}` };
        products.push(newProduct);
        return newProduct;
    }
};

export const deleteProduct = async (productId: string): Promise<{ success: true }> => {
    await simulateDelay(200);
    products = products.filter(p => p.id !== productId);
    return { success: true };
};

export const updateStock = async (productId: string, newStock: number): Promise<Product> => {
    await simulateDelay(100);
    let updatedProduct: Product | undefined;
    products = products.map(p => {
        if (p.id === productId) {
            updatedProduct = { ...p, currentStock: newStock };
            return updatedProduct;
        }
        return p;
    });
    if (!updatedProduct) throw new Error("Product not found");
    return updatedProduct;
};

// Users
export const getUsers = async (): Promise<User[]> => {
    await simulateDelay(100);
    return JSON.parse(JSON.stringify(users));
};

export const saveUser = async (user: User): Promise<User> => {
    await simulateDelay(200);
    if (user.id) {
        users = users.map(u => u.id === user.id ? user : u);
        return user;
    } else {
        const newUser = { ...user, id: `u${Date.now()}` };
        users.push(newUser);
        return newUser;
    }
};

export const deleteUser = async (userId: string): Promise<{ success: true }> => {
    await simulateDelay(200);
    users = users.filter(u => u.id !== userId);
    return { success: true };
};


// Suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
    await simulateDelay(250);
    return JSON.parse(JSON.stringify(suppliers));
};

export const saveSupplier = async (supplier: Supplier): Promise<Supplier> => {
    await simulateDelay(200);
    if (supplier.id) {
        suppliers = suppliers.map(s => s.id === supplier.id ? supplier : s);
        return supplier;
    } else {
        const newSupplier = { ...supplier, id: `s${Date.now()}` };
        suppliers.push(newSupplier);
        return newSupplier;
    }
};

export const deleteSupplier = async (supplierId: string): Promise<{ success: true }> => {
    await simulateDelay(200);
    suppliers = suppliers.filter(s => s.id !== supplierId);
    return { success: true };
};


// Orders
export const getOrders = async (): Promise<Order[]> => {
    await simulateDelay(400);
    return JSON.parse(JSON.stringify(orders));
}

export const createOrdersFromCart = async (cart: ShoppingCartItem[], currentProducts: Product[], currentSuppliers: Supplier[]): Promise<Order[]> => {
    await simulateDelay(500);
    const initialOrdersBySupplier: Record<string, OrderItem[]> = {};
    const ordersBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.supplierId]) acc[item.supplierId] = [];
        const product = currentProducts.find(p => p.id === item.productId);
        const supplier = currentSuppliers.find(s => s.id === item.supplierId);
        const supplierProduct = supplier?.products.find(sp => sp.internalProductId === item.productId);
        if (product && supplierProduct) {
            acc[item.supplierId].push({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                receivedQuantity: 0,
                unit: product.unit,
                pricePerUnit: supplierProduct.price,
            });
        }
        return acc;
    }, initialOrdersBySupplier);

    const newOrders: Order[] = Object.entries(ordersBySupplier).map(([supplierId, items]) => ({
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        supplierId: supplierId,
        supplierName: currentSuppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier',
        date: new Date().toISOString(),
        status: 'Brouillon',
        items: items,
        total: items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0),
    }));

    orders.push(...newOrders);
    return newOrders;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
    await simulateDelay(150);
    let updatedOrder: Order | undefined;
    orders = orders.map(o => {
        if (o.id === orderId) {
            updatedOrder = { ...o, status };
            return updatedOrder;
        }
        return o;
    });
    if (!updatedOrder) throw new Error("Order not found");
    return updatedOrder;
}

export const receiveOrderItems = async (orderId: string, receivedItems: { productId: string, quantity: number }[]): Promise<{ updatedOrder: Order, updatedProducts: Product[] }> => {
    await simulateDelay(300);
    let updatedOrder: Order | undefined;
    const updatedProductIds = new Set<string>();

    orders = orders.map(order => {
        if (order.id !== orderId) return order;
        
        let totalReceived = 0;
        let totalOrdered = 0;
        const updatedItems = order.items.map(item => {
            const receivedItem = receivedItems.find(ri => ri.productId === item.productId);
            const newlyReceivedQty = receivedItem ? receivedItem.quantity : 0;
            const newReceivedTotal = item.receivedQuantity + newlyReceivedQty;
            totalOrdered += item.quantity;
            totalReceived += newReceivedTotal;
            return { ...item, receivedQuantity: newReceivedTotal };
        });
        const newStatus = totalReceived >= totalOrdered ? 'Reçue totalement' : 'Reçue partiellement';
        updatedOrder = { ...order, items: updatedItems, status: newStatus };
        return updatedOrder;
    });

    if (!updatedOrder) throw new Error("Order not found");

    products = products.map(p => {
        const receivedItem = receivedItems.find(ri => ri.productId === p.id);
        if (receivedItem) {
            updatedProductIds.add(p.id);
            return { ...p, currentStock: p.currentStock + receivedItem.quantity };
        }
        return p;
    });

    const updatedProducts = products.filter(p => updatedProductIds.has(p.id));

    return { updatedOrder, updatedProducts };
};

// Settings
export const getAppSettings = async (): Promise<AppSettings> => {
    await simulateDelay(50);
    return JSON.parse(JSON.stringify(appSettings));
};

export const saveAppSettings = async (newSettings: AppSettings): Promise<AppSettings> => {
    await simulateDelay(200);
    appSettings = newSettings;
    return JSON.parse(JSON.stringify(appSettings));
};

// Sales
export const updateStockFromSales = async (sales: SaleItem[]): Promise<Product[]> => {
    await simulateDelay(300);
    products = products.map(p => {
        const sale = sales.find(s => s.productName === p.name);
        if (sale) {
            const newStock = p.currentStock - sale.quantitySold;
            return { ...p, currentStock: newStock < 0 ? 0 : newStock };
        }
        return p;
    });
    return JSON.parse(JSON.stringify(products));
};


// Stock Import
export const getStockImportHistory = async (): Promise<StockImportRecord[]> => {
    await simulateDelay(200);
    return JSON.parse(JSON.stringify(stockImportHistory));
};

export const importStockLevels = async (fileName: string, stockUpdates: { productName: string, newStock: number }[]): Promise<{ updatedProducts: Product[], newHistoryRecord: StockImportRecord }> => {
    await simulateDelay(400);
    const updatesMap = new Map(stockUpdates.map(u => [u.productName, u.newStock]));
    
    products = products.map(p => {
        if (updatesMap.has(p.name)) {
            return { ...p, currentStock: updatesMap.get(p.name)! };
        }
        return p;
    });
    
    const newHistoryRecord: StockImportRecord = {
        id: `si${Date.now()}`,
        date: new Date().toISOString(),
        fileName,
        productsUpdated: stockUpdates.length,
    };
    
    stockImportHistory.unshift(newHistoryRecord);
    
    return {
        updatedProducts: JSON.parse(JSON.stringify(products)),
        newHistoryRecord: JSON.parse(JSON.stringify(newHistoryRecord)),
    };
};