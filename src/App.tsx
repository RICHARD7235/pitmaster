import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, Supplier, Order, OrderItem, ShoppingCartItem, View, User, Role, SaleItem, AppSettings, StockImportRecord } from './types';
import { MOCK_PRODUCTS, MOCK_SUPPLIERS, MOCK_USERS } from './data/mockData';
import { Icons, type IconName } from './components/common/Icons';
import Dashboard from './components/Dashboard';
import StockList from './components/StockList';
import SuppliersList from './components/SuppliersList';
import OrderSuggestions from './components/OrderSuggestions';
import ShoppingCart from './components/ShoppingCart';
import OrdersList from './components/OrdersList';
import ReceiveOrderModal from './components/modals/ReceiveOrderModal';
import ImportCatalogModal from './components/modals/ImportCatalogModal';
import ImportSalesModal from './components/modals/ImportSalesModal';
import AdministrationPage from './pages/AdministrationPage';
import * as api from './services/apiService';

const App: React.FC = () => {
    // Core Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [shoppingCart, setShoppingCart] = useState<ShoppingCartItem[]>([]);
    const [stockImportHistory, setStockImportHistory] = useState<StockImportRecord[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isBackOfficeVisible, setBackOfficeVisible] = useState(false);

    // App Settings State
    const [appSettings, setAppSettings] = useState<AppSettings>({
        apiKey: '',
        aiModel: 'gemini-2.5-flash',
    });
    
    // Modal States
    const [receivingOrder, setReceivingOrder] = useState<Order | null>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isSalesModalOpen, setSalesModalOpen] = useState(false);
    
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [productsData, suppliersData, usersData, settingsData, ordersData, historyData] = await Promise.all([
                    api.getProducts(),
                    api.getSuppliers(),
                    api.getUsers(),
                    api.getAppSettings(),
                    api.getOrders(),
                    api.getStockImportHistory(),
                ]);
                setProducts(productsData);
                setSuppliers(suppliersData);
                setUsers(usersData);
                setAppSettings(settingsData);
                setCurrentUser(usersData[0] || null);
                setOrders(ordersData);
                setStockImportHistory(historyData);
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);


    const lowStockProducts = useMemo(() => products.filter(p => p.currentStock < p.minStock), [products]);

    // Product Handlers
    const handleSaveProduct = useCallback(async (productToSave: Product) => {
        const savedProduct = await api.saveProduct(productToSave);
        if (productToSave.id) {
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProducts(prev => [...prev, savedProduct]);
        }
    }, []);

    const handleDeleteProduct = useCallback(async (productId: string) => {
        await api.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    }, []);
    
    // User Handlers
    const handleSaveUser = useCallback(async (userToSave: User) => {
        const savedUser = await api.saveUser(userToSave);
        if (userToSave.id) {
            setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            setUsers(prev => [...prev, savedUser]);
        }
    }, []);

    const handleDeleteUser = useCallback(async (userId: string) => {
        await api.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, []);

    // Supplier Handlers
    const handleSaveSupplier = useCallback(async (supplierToSave: Supplier) => {
        const savedSupplier = await api.saveSupplier(supplierToSave);
        if (supplierToSave.id) {
            setSuppliers(prev => prev.map(s => s.id === savedSupplier.id ? savedSupplier : s));
        } else {
            setSuppliers(prev => [...prev, savedSupplier]);
        }
    }, []);

    const handleDeleteSupplier = useCallback(async (supplierId: string) => {
        await api.deleteSupplier(supplierId);
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    }, []);


    const handleUpdateStock = useCallback(async (productId: string, newStock: number) => {
        const updatedProduct = await api.updateStock(productId, newStock);
        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId ? updatedProduct : p
            )
        );
    }, []);

    const addToCart = useCallback((item: ShoppingCartItem) => {
        setShoppingCart(prevCart => {
            const existingItem = prevCart.find(i => i.productId === item.productId && i.supplierId === item.supplierId);
            if (existingItem) {
                return prevCart.map(i =>
                    i.productId === item.productId && i.supplierId === item.supplierId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prevCart, item];
        });
    }, []);
    
    const updateCartItemQuantity = useCallback((productId: string, supplierId: string, newQuantity: number) => {
        setShoppingCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => !(item.productId === productId && item.supplierId === supplierId));
            }
            return prevCart.map(item =>
                item.productId === productId && item.supplierId === supplierId
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    }, []);

    const placeOrder = useCallback(async () => {
        if (shoppingCart.length === 0) return;
        
        const newOrders = await api.createOrdersFromCart(shoppingCart, products, suppliers);

        setOrders(prev => [...prev, ...newOrders]);
        setShoppingCart([]);
        setActiveView('orders');
    }, [shoppingCart, products, suppliers]);
    
    const handleSendOrder = useCallback(async (orderId: string) => {
        const updatedOrder = await api.updateOrderStatus(orderId, 'Envoyée');
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }, []);

    const handleStartReception = useCallback((orderId: string) => {
        const orderToReceive = orders.find(o => o.id === orderId);
        if (orderToReceive) setReceivingOrder(orderToReceive);
    }, [orders]);

    const handleConfirmReception = useCallback(async (orderId: string, receivedItems: { productId: string, quantity: number }[]) => {
        const { updatedOrder, updatedProducts } = await api.receiveOrderItems(orderId, receivedItems);
        
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? updatedOrder : o));
        
        setProducts(prevProducts => {
            const productsToUpdateMap = new Map(updatedProducts.map(p => [p.id, p]));
            return prevProducts.map(p => productsToUpdateMap.get(p.id) || p);
        });

        setReceivingOrder(null);
    }, []);
    
    const handleCancelOrder = useCallback(async (orderId: string) => {
        const updatedOrder = await api.updateOrderStatus(orderId, 'Annulée');
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }, []);
    
    const handleUpdateStockFromSales = useCallback(async (sales: SaleItem[]) => {
        const updatedProducts = await api.updateStockFromSales(sales);
        setProducts(updatedProducts);
        setSalesModalOpen(false);
    }, []);
    
    const handleStockImport = useCallback(async (fileName: string, stockUpdates: { productName: string, newStock: number }[]) => {
        const { updatedProducts, newHistoryRecord } = await api.importStockLevels(fileName, stockUpdates);
        setProducts(updatedProducts);
        setStockImportHistory(prev => [newHistoryRecord, ...prev]);
    }, []);

    const handleNavigate = (view: View) => {
        if (view === 'administration') {
            setBackOfficeVisible(true);
        } else {
            setBackOfficeVisible(false);
            setActiveView(view);
        }
    };
    
    if (isLoading || !currentUser) {
        return (
             <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center">
                    <Icons name="spinner" className="h-12 w-12 animate-spin text-orange-500" />
                    <p className="mt-4 text-lg font-semibold text-white">Chargement de l'application...</p>
                </div>
            </div>
        )
    }

    const renderFrontOffice = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard lowStockCount={lowStockProducts.length} onNavigate={handleNavigate} orders={orders} suppliers={suppliers} products={products} />;
            case 'stock': return <StockList products={products} onUpdateStock={handleUpdateStock} role={currentUser.role} onImportSalesClick={() => setSalesModalOpen(true)} />;
            case 'suppliers': return <SuppliersList suppliers={suppliers} products={products} role={currentUser.role} onImportClick={() => setImportModalOpen(true)} />;
            case 'suggestions': return <OrderSuggestions lowStockProducts={lowStockProducts} suppliers={suppliers} addToCart={addToCart} onNavigate={handleNavigate} aiModel={appSettings.aiModel} />;
            case 'cart': return <ShoppingCart cartItems={shoppingCart} products={products} suppliers={suppliers} onUpdateQuantity={updateCartItemQuantity} onPlaceOrder={placeOrder} role={currentUser.role} />;
            case 'orders': return <OrdersList orders={orders} role={currentUser.role} onStartReception={handleStartReception} onCancelOrder={handleCancelOrder} onSendOrder={handleSendOrder} />;
            default: return <Dashboard lowStockCount={lowStockProducts.length} onNavigate={handleNavigate} orders={orders} suppliers={suppliers} products={products}/>;
        }
    };

    const NavItem = ({ view, icon, label }: { view: View; icon: IconName; label: string }) => (
        <li className="mb-2">
            <button
                onClick={() => handleNavigate(view)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    activeView === view && !isBackOfficeVisible
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
                <Icons name={icon} className="h-6 w-6 mr-3" />
                <span className="font-medium">{label}</span>
                 {label === 'Alertes & Suggestions' && lowStockProducts.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{lowStockProducts.length}</span>
                )}
                 {label === 'Panier' && shoppingCart.length > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{shoppingCart.length}</span>
                )}
            </button>
        </li>
    );

    const navLinks: { view: View; icon: IconName; label: string; roles: Role[] }[] = [
        { view: 'dashboard', icon: 'dashboard', label: 'Tableau de bord', roles: ['Gérant', 'Chef', 'Commis'] },
        { view: 'suggestions', icon: 'bulb', label: 'Alertes & Suggestions', roles: ['Gérant', 'Chef'] },
        { view: 'stock', icon: 'box', label: 'Gestion des Stocks', roles: ['Gérant', 'Chef', 'Commis'] },
        { view: 'suppliers', icon: 'truck', label: 'Fournisseurs', roles: ['Gérant', 'Chef'] },
        { view: 'cart', icon: 'cart', label: 'Panier', roles: ['Gérant', 'Chef'] },
        { view: 'orders', icon: 'receipt', label: 'Commandes', roles: ['Gérant', 'Chef', 'Commis'] },
        { view: 'administration', icon: 'settings', label: 'Administration', roles: ['Gérant'] },
    ];
    
    if (isBackOfficeVisible && currentUser.role === 'Gérant') {
        return <AdministrationPage 
            onClose={() => setBackOfficeVisible(false)}
            products={products}
            suppliers={suppliers}
            users={users}
            appSettings={appSettings}
            stockImportHistory={stockImportHistory}
            onSaveSettings={setAppSettings}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            onStockImport={handleStockImport}
            onSaveSupplier={handleSaveSupplier}
            onDeleteSupplier={handleDeleteSupplier}
        />;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            <nav className="w-64 bg-gray-800 p-4 flex flex-col shadow-2xl">
                <div className="flex items-center mb-8">
                    <Icons name="flame" className="h-10 w-10 text-orange-500" />
                    <h1 className="text-xl font-bold ml-2 text-white">L'Économe Pitmaster</h1>
                </div>
                <ul>
                    {navLinks.filter(link => link.roles.includes(currentUser.role)).map(link => (
                        <NavItem key={link.view} {...link} />
                    ))}
                </ul>
                <div className="mt-auto p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Icons name="user" className="h-10 w-10 text-gray-500"/>
                      <div className="ml-2">
                        <p className="font-semibold">{currentUser.name}</p>
                        <p className="text-sm text-orange-400 font-bold">{currentUser.role}</p>
                      </div>
                    </div>
                    <select
                        value={currentUser.id}
                        onChange={(e) => {
                            const selectedUser = users.find(u => u.id === e.target.value);
                            if (selectedUser) {
                                setCurrentUser(selectedUser);
                                setActiveView('dashboard');
                                if(selectedUser.role !== 'Gérant') setBackOfficeVisible(false);
                            }
                        }}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                       {users.map(user => (
                           <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                       ))}
                    </select>
                </div>
            </nav>
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-900">
                {renderFrontOffice()}
            </main>

            <ReceiveOrderModal
                order={receivingOrder}
                onConfirm={handleConfirmReception}
                onClose={() => setReceivingOrder(null)}
            />

            <ImportCatalogModal 
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
            />

            <ImportSalesModal
                isOpen={isSalesModalOpen}
                onClose={() => setSalesModalOpen(false)}
                onConfirm={handleUpdateStockFromSales}
            />
        </div>
    );
};

export default App;