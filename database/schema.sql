-- L'Économe Pitmaster - Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    family VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    average_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_family ON products(family);
CREATE INDEX idx_products_low_stock ON products(current_stock, min_stock) WHERE current_stock < min_stock;

-- ============================================================================
-- SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE suppliers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    delivery_days VARCHAR(255),
    min_order DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(name);

-- ============================================================================
-- SUPPLIER_PRODUCTS TABLE (Many-to-Many relationship)
-- ============================================================================
CREATE TABLE supplier_products (
    id SERIAL PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL,
    internal_product_id VARCHAR(255) NOT NULL,
    supplier_sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (internal_product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(supplier_id, internal_product_id)
);

CREATE INDEX idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_product ON supplier_products(internal_product_id);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Gérant', 'Chef', 'Commis')),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'Brouillon',
        'Envoyée',
        'Confirmée',
        'Reçue partiellement',
        'Reçue totalement',
        'Annulée'
    )),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_orders_supplier ON orders(supplier_id);
CREATE INDEX idx_orders_date ON orders(date DESC);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================================
-- ORDER_ITEMS TABLE
-- ============================================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    received_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- STOCK_IMPORT_HISTORY TABLE
-- ============================================================================
CREATE TABLE stock_import_history (
    id VARCHAR(255) PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    products_updated INT NOT NULL DEFAULT 0,
    imported_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imported_by) REFERENCES users(id)
);

CREATE INDEX idx_stock_import_date ON stock_import_history(date DESC);

-- ============================================================================
-- APP_SETTINGS TABLE
-- ============================================================================
CREATE TABLE app_settings (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic')),
    api_key TEXT,
    ai_model VARCHAR(100) NOT NULL,
    openai_api_key TEXT,
    anthropic_api_key TEXT,
    gemini_api_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO app_settings (provider, ai_model)
VALUES ('gemini', 'gemini-2.5-flash');

-- ============================================================================
-- STOCK MOVEMENTS TABLE (Optional - for audit trail)
-- ============================================================================
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
        'SALE',
        'PURCHASE',
        'ADJUSTMENT',
        'IMPORT',
        'RECEIVE_ORDER'
    )),
    quantity DECIMAL(10,2) NOT NULL,
    previous_stock DECIMAL(10,2) NOT NULL,
    new_stock DECIMAL(10,2) NOT NULL,
    reference_id VARCHAR(255),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_products_updated_at
    BEFORE UPDATE ON supplier_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View to show low stock products
CREATE VIEW low_stock_products AS
SELECT
    p.id,
    p.name,
    p.family,
    p.current_stock,
    p.min_stock,
    p.unit,
    (p.min_stock - p.current_stock) AS shortage_quantity
FROM products p
WHERE p.current_stock < p.min_stock
ORDER BY (p.min_stock - p.current_stock) DESC;

-- View to show monthly spending summary
CREATE VIEW monthly_spending AS
SELECT
    DATE_TRUNC('month', date) AS month,
    COUNT(*) AS order_count,
    SUM(total) AS total_spent
FROM orders
WHERE status NOT IN ('Annulée', 'Brouillon')
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- View to show supplier product catalog with best prices
CREATE VIEW supplier_product_catalog AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.family,
    p.unit,
    s.id AS supplier_id,
    s.name AS supplier_name,
    sp.supplier_sku,
    sp.price,
    RANK() OVER (PARTITION BY p.id ORDER BY sp.price ASC) AS price_rank
FROM products p
JOIN supplier_products sp ON p.id = sp.internal_product_id
JOIN suppliers s ON sp.supplier_id = s.id
ORDER BY p.name, sp.price;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE products IS 'Product catalog with stock levels';
COMMENT ON TABLE suppliers IS 'Supplier information and delivery schedules';
COMMENT ON TABLE supplier_products IS 'Product pricing per supplier (many-to-many)';
COMMENT ON TABLE users IS 'Application users with role-based access';
COMMENT ON TABLE orders IS 'Purchase orders to suppliers';
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON TABLE stock_import_history IS 'Audit log of bulk stock imports';
COMMENT ON TABLE app_settings IS 'Application configuration including AI settings';
COMMENT ON TABLE stock_movements IS 'Audit trail for all stock changes';
