import React, { useState } from 'react';
import { Product, User, AppSettings, StockImportRecord, Supplier } from '../types';
import { Icons } from './common/Icons';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import PreferencesPage from './PreferencesPage';
import EditProductModal from './EditProductModal';
import EditUserModal from './EditUserModal';
import StockManagement from './StockManagement';
import ImportStockModal from './ImportStockModal';
import SupplierManagement from './SupplierManagement';
import EditSupplierModal from './EditSupplierModal';


interface AdministrationPageProps {
    onClose: () => void;
    products: Product[];
    suppliers: Supplier[];
    users: User[];
    appSettings: AppSettings;
    stockImportHistory: StockImportRecord[];
    onSaveSettings: (settings: AppSettings) => void;
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onStockImport: (fileName: string, stockUpdates: { productName: string, newStock: number }[]) => void;
    onSaveSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (supplierId: string) => void;
}

type AdminView = 'products' | 'suppliers' | 'users' | 'settings' | 'stock';

const AdministrationPage: React.FC<AdministrationPageProps> = (props) => {
    const [activeView, setActiveView] = useState<AdminView>('products');
    const [editingProduct, setEditingProduct] = useState<Product | 'new' | null>(null);
    const [editingUser, setEditingUser] = useState<User | 'new' | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | 'new' | null>(null);
    const [isImportStockModalOpen, setImportStockModalOpen] = useState(false);

    const renderView = () => {
        switch(activeView) {
            case 'products':
                return <ProductManagement 
                            products={props.products} 
                            onEditProduct={(p) => setEditingProduct(p)}
                            onDeleteProduct={props.onDeleteProduct}
                            onAddProduct={() => setEditingProduct('new')}
                        />;
            case 'suppliers':
                return <SupplierManagement
                            suppliers={props.suppliers}
                            onEditSupplier={(s) => setEditingSupplier(s)}
                            onDeleteSupplier={props.onDeleteSupplier}
                            onAddSupplier={() => setEditingSupplier('new')}
                        />;
            case 'users':
                return <UserManagement 
                            users={props.users}
                            onEditUser={(u) => setEditingUser(u)}
                            onDeleteUser={props.onDeleteUser}
                            onAddUser={() => setEditingUser('new')}
                        />;
            case 'settings':
                return <PreferencesPage settings={props.appSettings} onSave={props.onSaveSettings} />;
            case 'stock':
                return <StockManagement 
                            history={props.stockImportHistory}
                            onNewImport={() => setImportStockModalOpen(true)}
                        />;
            default:
                return null;
        }
    }
    
    const NavTab: React.FC<{view: AdminView, label: string}> = ({ view, label }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 font-semibold rounded-t-lg border-b-2 transition-colors ${activeView === view ? 'border-orange-500 text-white' : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
        >
            {label}
        </button>
    )

    const handleConfirmStockImport = (fileName: string, stockUpdates: { productName: string, newStock: number }[]) => {
        props.onStockImport(fileName, stockUpdates);
        setImportStockModalOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Administration</h2>
                        <p className="text-gray-400">Gestion des données de l'application</p>
                    </div>
                    <button 
                        onClick={props.onClose} 
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105"
                    >
                        Retour au Front Office
                    </button>
                </div>
                
                <div className="border-b border-gray-700 mb-6">
                    <nav className="flex space-x-4">
                        <NavTab view="products" label="Gestion Produits" />
                        <NavTab view="suppliers" label="Gestion Fournisseurs" />
                        <NavTab view="users" label="Gestion Utilisateurs" />
                        <NavTab view="stock" label="Gestion Stocks" />
                        <NavTab view="settings" label="Préférences IA" />
                    </nav>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    {renderView()}
                </div>
            </div>

            <EditProductModal
                product={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSave={props.onSaveProduct}
            />
            
            <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={props.onSaveUser}
            />
            
             <EditSupplierModal
                supplier={editingSupplier}
                products={props.products}
                onClose={() => setEditingSupplier(null)}
                onSave={props.onSaveSupplier}
            />
            
            <ImportStockModal
                isOpen={isImportStockModalOpen}
                onClose={() => setImportStockModalOpen(false)}
                onConfirm={handleConfirmStockImport}
                products={props.products}
            />

        </div>
    );
};

export default AdministrationPage;