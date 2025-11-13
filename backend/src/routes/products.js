const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/low-stock - Get products below minimum stock
router.get('/low-stock', async (req, res) => {
  try {
    const result = await query('SELECT * FROM low_stock_products');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product
router.post('/',
  [
    body('id').notEmpty().trim(),
    body('name').notEmpty().trim(),
    body('unit').notEmpty().trim(),
    body('currentStock').isFloat({ min: 0 }),
    body('minStock').isFloat({ min: 0 }),
    body('averageCost').isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id, name, family, unit, currentStock, minStock, averageCost } = req.body;

      const result = await query(
        `INSERT INTO products (id, name, family, unit, current_stock, min_stock, average_cost)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id, name, family, unit, currentStock, minStock, averageCost]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Product with this ID already exists' });
      }
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// PUT /api/products/:id - Update product
router.put('/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('unit').optional().notEmpty().trim(),
    body('currentStock').optional().isFloat({ min: 0 }),
    body('minStock').optional().isFloat({ min: 0 }),
    body('averageCost').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, family, unit, currentStock, minStock, averageCost } = req.body;

      const result = await query(
        `UPDATE products
         SET name = COALESCE($1, name),
             family = COALESCE($2, family),
             unit = COALESCE($3, unit),
             current_stock = COALESCE($4, current_stock),
             min_stock = COALESCE($5, min_stock),
             average_cost = COALESCE($6, average_cost),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, family, unit, currentStock, minStock, averageCost, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// PATCH /api/products/:id/stock - Update only stock level
router.patch('/:id/stock',
  [
    body('newStock').isFloat({ min: 0 }),
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
      const { newStock } = req.body;

      // Get current stock
      const currentResult = await client.query(
        'SELECT current_stock FROM products WHERE id = $1',
        [id]
      );

      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }

      const previousStock = currentResult.rows[0].current_stock;

      // Update stock
      const updateResult = await client.query(
        `UPDATE products
         SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newStock, id]
      );

      // Log stock movement
      await client.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, notes)
         VALUES ($1, 'ADJUSTMENT', $2, $3, $4, 'Manual adjustment')`,
        [id, newStock - previousStock, previousStock, newStock]
      );

      await client.query('COMMIT');
      res.json(updateResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    } finally {
      client.release();
    }
  }
);

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product: result.rows[0] });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/products/update-stock-from-sales - Update stock from sales data
router.post('/update-stock-from-sales',
  [
    body('sales').isArray(),
    body('sales.*.productName').notEmpty(),
    body('sales.*.quantitySold').isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const { sales } = req.body;
      const updatedProducts = [];

      for (const sale of sales) {
        const { productName, quantitySold } = sale;

        // Find product by name
        const productResult = await client.query(
          'SELECT * FROM products WHERE name = $1',
          [productName]
        );

        if (productResult.rows.length === 0) {
          console.warn(`Product not found: ${productName}`);
          continue;
        }

        const product = productResult.rows[0];
        const previousStock = product.current_stock;
        const newStock = Math.max(0, previousStock - quantitySold);

        // Update stock
        const updateResult = await client.query(
          `UPDATE products
           SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2
           RETURNING *`,
          [newStock, product.id]
        );

        // Log stock movement
        await client.query(
          `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, notes)
           VALUES ($1, 'SALE', $2, $3, $4, $5)`,
          [product.id, -quantitySold, previousStock, newStock, `Sale: ${quantitySold} ${product.unit}`]
        );

        updatedProducts.push(updateResult.rows[0]);
      }

      await client.query('COMMIT');
      res.json({
        message: 'Stock updated from sales',
        updatedProducts,
        totalUpdated: updatedProducts.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating stock from sales:', error);
      res.status(500).json({ error: 'Failed to update stock from sales' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
