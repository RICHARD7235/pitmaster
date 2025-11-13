const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET /api/suppliers - Get all suppliers with their products
router.get('/', async (req, res) => {
  try {
    // Get all suppliers
    const suppliersResult = await query('SELECT * FROM suppliers ORDER BY name');
    const suppliers = suppliersResult.rows;

    // Get all supplier products
    const productsResult = await query(`
      SELECT sp.*, p.name as product_name
      FROM supplier_products sp
      JOIN products p ON sp.internal_product_id = p.id
      ORDER BY sp.supplier_id
    `);

    // Group products by supplier
    const suppliersWithProducts = suppliers.map(supplier => ({
      ...supplier,
      products: productsResult.rows
        .filter(sp => sp.supplier_id === supplier.id)
        .map(sp => ({
          internalProductId: sp.internal_product_id,
          supplierSku: sp.supplier_sku,
          price: parseFloat(sp.price),
          productName: sp.product_name
        }))
    }));

    // Convert snake_case to camelCase for frontend compatibility
    const formattedSuppliers = suppliersWithProducts.map(s => ({
      id: s.id,
      name: s.name,
      deliveryDays: s.delivery_days,
      minOrder: parseFloat(s.min_order),
      products: s.products
    }));

    res.json(formattedSuppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /api/suppliers/:id - Get single supplier
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get supplier
    const supplierResult = await query('SELECT * FROM suppliers WHERE id = $1', [id]);

    if (supplierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get supplier's products
    const productsResult = await query(`
      SELECT sp.*, p.name as product_name
      FROM supplier_products sp
      JOIN products p ON sp.internal_product_id = p.id
      WHERE sp.supplier_id = $1
    `, [id]);

    const supplier = supplierResult.rows[0];
    const products = productsResult.rows.map(sp => ({
      internalProductId: sp.internal_product_id,
      supplierSku: sp.supplier_sku,
      price: parseFloat(sp.price),
      productName: sp.product_name
    }));

    res.json({
      id: supplier.id,
      name: supplier.name,
      deliveryDays: supplier.delivery_days,
      minOrder: parseFloat(supplier.min_order),
      products
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// POST /api/suppliers - Create new supplier
router.post('/',
  [
    body('id').notEmpty().trim(),
    body('name').notEmpty().trim(),
    body('deliveryDays').optional(),
    body('minOrder').isFloat({ min: 0 }),
    body('products').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const { id, name, deliveryDays, minOrder, products = [] } = req.body;

      // Insert supplier
      const supplierResult = await client.query(
        `INSERT INTO suppliers (id, name, delivery_days, min_order)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, name, deliveryDays, minOrder]
      );

      // Insert supplier products
      for (const product of products) {
        await client.query(
          `INSERT INTO supplier_products (supplier_id, internal_product_id, supplier_sku, price)
           VALUES ($1, $2, $3, $4)`,
          [id, product.internalProductId, product.supplierSku, product.price]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        id: supplierResult.rows[0].id,
        name: supplierResult.rows[0].name,
        deliveryDays: supplierResult.rows[0].delivery_days,
        minOrder: parseFloat(supplierResult.rows[0].min_order),
        products
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating supplier:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Supplier with this ID already exists' });
      }
      res.status(500).json({ error: 'Failed to create supplier' });
    } finally {
      client.release();
    }
  }
);

// PUT /api/suppliers/:id - Update supplier
router.put('/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('deliveryDays').optional(),
    body('minOrder').optional().isFloat({ min: 0 }),
    body('products').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const { name, deliveryDays, minOrder, products } = req.body;

      // Update supplier
      const supplierResult = await client.query(
        `UPDATE suppliers
         SET name = COALESCE($1, name),
             delivery_days = COALESCE($2, delivery_days),
             min_order = COALESCE($3, min_order),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [name, deliveryDays, minOrder, id]
      );

      if (supplierResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Supplier not found' });
      }

      // Update products if provided
      if (products) {
        // Delete existing products
        await client.query('DELETE FROM supplier_products WHERE supplier_id = $1', [id]);

        // Insert new products
        for (const product of products) {
          await client.query(
            `INSERT INTO supplier_products (supplier_id, internal_product_id, supplier_sku, price)
             VALUES ($1, $2, $3, $4)`,
            [id, product.internalProductId, product.supplierSku, product.price]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch complete supplier data
      const updatedSupplierResult = await query('SELECT * FROM suppliers WHERE id = $1', [id]);
      const productsResult = await query(
        'SELECT * FROM supplier_products WHERE supplier_id = $1',
        [id]
      );

      const supplier = updatedSupplierResult.rows[0];
      res.json({
        id: supplier.id,
        name: supplier.name,
        deliveryDays: supplier.delivery_days,
        minOrder: parseFloat(supplier.min_order),
        products: productsResult.rows.map(sp => ({
          internalProductId: sp.internal_product_id,
          supplierSku: sp.supplier_sku,
          price: parseFloat(sp.price)
        }))
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating supplier:', error);
      res.status(500).json({ error: 'Failed to update supplier' });
    } finally {
      client.release();
    }
  }
);

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully', supplier: result.rows[0] });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// GET /api/suppliers/catalog/compare - Compare prices for a product across suppliers
router.get('/catalog/compare/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await query(`
      SELECT
        s.id as supplier_id,
        s.name as supplier_name,
        sp.supplier_sku,
        sp.price,
        s.delivery_days,
        s.min_order
      FROM supplier_products sp
      JOIN suppliers s ON sp.supplier_id = s.id
      WHERE sp.internal_product_id = $1
      ORDER BY sp.price ASC
    `, [productId]);

    res.json(result.rows.map(row => ({
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      supplierSku: row.supplier_sku,
      price: parseFloat(row.price),
      deliveryDays: row.delivery_days,
      minOrder: parseFloat(row.min_order)
    })));
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ error: 'Failed to compare prices' });
  }
});

module.exports = router;
