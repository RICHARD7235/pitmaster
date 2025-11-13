-- L'Économe Pitmaster - Seed Data
-- Initial data to populate the database

-- ============================================================================
-- PRODUCTS
-- ============================================================================
INSERT INTO products (id, name, family, unit, current_stock, min_stock, average_cost) VALUES
('p1', 'Saumon Frais Label Rouge', 'Poisson', 'kg', 4, 5, 26),
('p2', 'Huile d''olive vierge extra', 'Épicerie', 'L', 1, 3, 11.75),
('p3', 'Filet de maquereau', 'Poisson', 'kg', 8, 5, 12),
('p4', 'Bois de Hêtre (fumage)', 'Fumage', 'Sac de 10 kg', 2, 2, 20),
('p5', 'Sel de Guérande', 'Épicerie', 'kg', 12, 10, 2.25),
('p6', 'Poivre noir en grains', 'Épicerie', 'kg', 0.8, 1, 14.5),
('p7', 'Côte de Boeuf', 'Viande', 'kg', 15, 10, 35);

-- ============================================================================
-- SUPPLIERS
-- ============================================================================
INSERT INTO suppliers (id, name, delivery_days, min_order) VALUES
('s1', 'Le Pêcheur Local', 'Mardi, Vendredi', 50),
('s2', 'Metro', 'Tous les jours sauf Dimanche', 100),
('s3', 'Épices du Monde', 'Mercredi', 30),
('s4', 'Fumoir & Co', 'Lundi', 0);

-- ============================================================================
-- SUPPLIER_PRODUCTS (Product catalog with pricing per supplier)
-- ============================================================================

-- Le Pêcheur Local products
INSERT INTO supplier_products (supplier_id, internal_product_id, supplier_sku, price) VALUES
('s1', 'p1', 'SAL-LR-01', 25),
('s1', 'p3', 'MAQ-FIL-01', 12);

-- Metro products
INSERT INTO supplier_products (supplier_id, internal_product_id, supplier_sku, price) VALUES
('s2', 'p1', 'MET-SAL-88', 27),
('s2', 'p2', 'MET-HUI-12', 12),
('s2', 'p5', 'MET-SEL-01', 2),
('s2', 'p6', 'MET-POI-02', 15),
('s2', 'p7', 'MET-BOEUF-45', 35);

-- Épices du Monde products
INSERT INTO supplier_products (supplier_id, internal_product_id, supplier_sku, price) VALUES
('s3', 'p2', 'EDM-OLIVE-IT', 11.50),
('s3', 'p5', 'EDM-SEL-FR', 2.5),
('s3', 'p6', 'EDM-POIVRE-VN', 14);

-- Fumoir & Co products
INSERT INTO supplier_products (supplier_id, internal_product_id, supplier_sku, price) VALUES
('s4', 'p4', 'FUM-HETRE-10', 20);

-- ============================================================================
-- USERS
-- ============================================================================
-- Note: password_hash is NULL for now. In production, implement proper authentication
INSERT INTO users (id, name, email, role, password_hash) VALUES
('u1', 'Jean Dupont', 'jean.dupont@example.com', 'Gérant', NULL),
('u2', 'Marie Curie', 'marie.curie@example.com', 'Chef', NULL),
('u3', 'Pierre Martin', 'pierre.martin@example.com', 'Commis', NULL);

-- ============================================================================
-- SAMPLE ORDERS (Optional - for demonstration purposes)
-- ============================================================================

-- Sample order 1: Sent to Le Pêcheur Local
INSERT INTO orders (id, supplier_id, supplier_name, date, status, total, created_by) VALUES
('ord1', 's1', 'Le Pêcheur Local', '2025-11-10 10:30:00', 'Envoyée', 125, 'u2');

INSERT INTO order_items (order_id, product_id, product_name, quantity, received_quantity, unit, price_per_unit) VALUES
('ord1', 'p1', 'Saumon Frais Label Rouge', 5, 0, 'kg', 25);

-- Sample order 2: Partially received from Metro
INSERT INTO orders (id, supplier_id, supplier_name, date, status, total, created_by) VALUES
('ord2', 's2', 'Metro', '2025-11-08 14:00:00', 'Reçue partiellement', 64, 'u1');

INSERT INTO order_items (order_id, product_id, product_name, quantity, received_quantity, unit, price_per_unit) VALUES
('ord2', 'p2', 'Huile d''olive vierge extra', 3, 2, 'L', 12),
('ord2', 'p5', 'Sel de Guérande', 10, 10, 'kg', 2),
('ord2', 'p6', 'Poivre noir en grains', 2, 0, 'kg', 15);

-- Sample order 3: Draft (not sent yet)
INSERT INTO orders (id, supplier_id, supplier_name, date, status, total, created_by) VALUES
('ord3', 's3', 'Épices du Monde', '2025-11-13 09:00:00', 'Brouillon', 28, 'u2');

INSERT INTO order_items (order_id, product_id, product_name, quantity, received_quantity, unit, price_per_unit) VALUES
('ord3', 'p6', 'Poivre noir en grains', 2, 0, 'kg', 14);

-- ============================================================================
-- STOCK IMPORT HISTORY (Optional - sample data)
-- ============================================================================
INSERT INTO stock_import_history (id, date, file_name, products_updated, imported_by) VALUES
('imp1', '2025-11-01 08:00:00', 'inventaire_novembre_2025.csv', 7, 'u1'),
('imp2', '2025-10-15 09:30:00', 'inventaire_mi_octobre_2025.csv', 7, 'u1');

-- ============================================================================
-- STOCK MOVEMENTS (Optional - audit trail examples)
-- ============================================================================

-- Initial stock import
INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes, created_by) VALUES
('p1', 'IMPORT', 4, 0, 4, 'imp1', 'Import initial', 'u1'),
('p2', 'IMPORT', 1, 0, 1, 'imp1', 'Import initial', 'u1'),
('p3', 'IMPORT', 8, 0, 8, 'imp1', 'Import initial', 'u1'),
('p4', 'IMPORT', 2, 0, 2, 'imp1', 'Import initial', 'u1'),
('p5', 'IMPORT', 12, 0, 12, 'imp1', 'Import initial', 'u1'),
('p6', 'IMPORT', 0.8, 0, 0.8, 'imp1', 'Import initial', 'u1'),
('p7', 'IMPORT', 15, 0, 15, 'imp1', 'Import initial', 'u1');

-- Sample sales
INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, notes, created_by) VALUES
('p1', 'SALE', -1, 5, 4, 'Vente restaurant', 'u2'),
('p2', 'SALE', -0.5, 1.5, 1, 'Vente restaurant', 'u2'),
('p6', 'SALE', -0.2, 1, 0.8, 'Vente restaurant', 'u2');

-- Sample order reception
INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes, created_by) VALUES
('p5', 'RECEIVE_ORDER', 10, 2, 12, 'ord2', 'Réception commande Metro', 'u3'),
('p2', 'RECEIVE_ORDER', 2, -1, 1, 'ord2', 'Réception partielle commande Metro', 'u3');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all products with their stock status
-- SELECT * FROM products ORDER BY name;

-- Show low stock products
-- SELECT * FROM low_stock_products;

-- Show supplier catalog with best prices
-- SELECT * FROM supplier_product_catalog WHERE price_rank = 1;

-- Show all orders with their status
-- SELECT o.id, o.supplier_name, o.date, o.status, o.total, COUNT(oi.id) as item_count
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- GROUP BY o.id
-- ORDER BY o.date DESC;

-- Show monthly spending
-- SELECT * FROM monthly_spending;
