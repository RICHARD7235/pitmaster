import { Product, Supplier, User, AppSettings, Order, ShoppingCartItem, OrderItem, SaleItem, StockImportRecord } from '../types';
import { apiClient } from '../config/api';

// --- PRODUCTS API ---

export const getProducts = async (): Promise<Product[]> => {
  return apiClient.get<Product[]>('/api/products');
};

export const saveProduct = async (product: Product): Promise<Product> => {
  // Check if product exists (has an id that looks like it came from DB)
  const existingProducts = await getProducts();
  const exists = existingProducts.some(p => p.id === product.id);

  if (exists) {
    // Update existing product
    return apiClient.put<Product>(`/api/products/${product.id}`, product);
  } else {
    // Create new product - generate ID if not provided
    const productData = {
      ...product,
      id: product.id || `p${Date.now()}`
    };
    return apiClient.post<Product>('/api/products', productData);
  }
};

export const deleteProduct = async (productId: string): Promise<{ success: true }> => {
  await apiClient.delete(`/api/products/${productId}`);
  return { success: true };
};

export const updateStock = async (productId: string, newStock: number): Promise<Product> => {
  return apiClient.patch<Product>(`/api/products/${productId}/stock`, { newStock });
};

// --- USERS API ---

export const getUsers = async (): Promise<User[]> => {
  return apiClient.get<User[]>('/api/users');
};

export const saveUser = async (user: User): Promise<User> => {
  const existingUsers = await getUsers();
  const exists = existingUsers.some(u => u.id === user.id);

  if (exists) {
    return apiClient.put<User>(`/api/users/${user.id}`, user);
  } else {
    const userData = {
      ...user,
      id: user.id || `u${Date.now()}`
    };
    return apiClient.post<User>('/api/users', userData);
  }
};

export const deleteUser = async (userId: string): Promise<{ success: true }> => {
  await apiClient.delete(`/api/users/${userId}`);
  return { success: true };
};

// --- SUPPLIERS API ---

export const getSuppliers = async (): Promise<Supplier[]> => {
  return apiClient.get<Supplier[]>('/api/suppliers');
};

export const saveSupplier = async (supplier: Supplier): Promise<Supplier> => {
  const existingSuppliers = await getSuppliers();
  const exists = existingSuppliers.some(s => s.id === supplier.id);

  if (exists) {
    return apiClient.put<Supplier>(`/api/suppliers/${supplier.id}`, supplier);
  } else {
    const supplierData = {
      ...supplier,
      id: supplier.id || `s${Date.now()}`
    };
    return apiClient.post<Supplier>('/api/suppliers', supplierData);
  }
};

export const deleteSupplier = async (supplierId: string): Promise<{ success: true }> => {
  await apiClient.delete(`/api/suppliers/${supplierId}`);
  return { success: true };
};

// --- ORDERS API ---

export const getOrders = async (): Promise<Order[]> => {
  return apiClient.get<Order[]>('/api/orders');
};

export const createOrdersFromCart = async (
  cart: ShoppingCartItem[],
  currentProducts: Product[],
  currentSuppliers: Supplier[]
): Promise<Order[]> => {
  // Group cart items by supplier
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

  // Create an order for each supplier
  const newOrders: Order[] = [];

  for (const [supplierId, items] of Object.entries(ordersBySupplier)) {
    const supplier = currentSuppliers.find(s => s.id === supplierId);
    const orderData = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      supplierId: supplierId,
      supplierName: supplier?.name || 'Unknown Supplier',
      items: items,
      status: 'Brouillon' as const,
    };

    const createdOrder = await apiClient.post<Order>('/api/orders', orderData);
    newOrders.push(createdOrder);
  }

  return newOrders;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  return apiClient.patch<Order>(`/api/orders/${orderId}/status`, { status });
};

export const receiveOrderItems = async (
  orderId: string,
  receivedItems: { productId: string, quantity: number }[]
): Promise<{ updatedOrder: Order, updatedProducts: Product[] }> => {
  // Call backend to receive order (it will update stock automatically)
  const updatedOrder = await apiClient.post<Order>(`/api/orders/${orderId}/receive`, {
    items: receivedItems.map(item => ({
      productId: item.productId,
      receivedQuantity: item.quantity
    }))
  });

  // Get updated products
  const updatedProducts = await getProducts();

  return { updatedOrder, updatedProducts };
};

// --- SETTINGS API ---

export const getAppSettings = async (): Promise<AppSettings> => {
  return apiClient.get<AppSettings>('/api/settings');
};

export const saveAppSettings = async (newSettings: AppSettings): Promise<AppSettings> => {
  return apiClient.put<AppSettings>('/api/settings', newSettings);
};

// Dashboard statistics
export interface DashboardStats {
  lowStockCount: number;
  activeOrders: number;
  activeSuppliers: number;
  monthlySpending: number;
  totalStockValue: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get<DashboardStats>('/api/settings/dashboard-stats');
};

// --- SALES API ---

export const updateStockFromSales = async (sales: SaleItem[]): Promise<Product[]> => {
  const response = await apiClient.post<{ updatedProducts: Product[] }>(
    '/api/products/update-stock-from-sales',
    { sales }
  );
  return response.updatedProducts;
};

// --- STOCK IMPORT API ---

export const getStockImportHistory = async (): Promise<StockImportRecord[]> => {
  // For now, return empty array as this feature is not yet in the backend
  // TODO: Add stock import history endpoint to backend
  return [];
};

export const importStockLevels = async (
  fileName: string,
  stockUpdates: { productName: string, newStock: number }[]
): Promise<{ updatedProducts: Product[], newHistoryRecord: StockImportRecord }> => {
  // Update each product's stock
  const updatedProducts: Product[] = [];

  for (const update of stockUpdates) {
    // Find product by name
    const products = await getProducts();
    const product = products.find(p => p.name === update.productName);

    if (product) {
      const updatedProduct = await updateStock(product.id, update.newStock);
      updatedProducts.push(updatedProduct);
    }
  }

  // Create a history record (mock for now since backend doesn't store this yet)
  const newHistoryRecord: StockImportRecord = {
    id: `si${Date.now()}`,
    date: new Date().toISOString(),
    fileName,
    productsUpdated: updatedProducts.length,
  };

  return { updatedProducts, newHistoryRecord };
};
