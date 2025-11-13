const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET /api/orders - Get all orders with items
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let queryText = `
      SELECT o.*
      FROM orders o
      ${status ? 'WHERE o.status = $1' : ''}
      ORDER BY o.date DESC
    `;

    const ordersResult = status
      ? await query(queryText, [status])
      : await query(queryText);

    // Get order items for all orders
    const orderIds = ordersResult.rows.map(o => o.id);
    let itemsResult = { rows: [] };

    if (orderIds.length > 0) {
      itemsResult = await query(
        `SELECT * FROM order_items WHERE order_id = ANY($1::text[])`,
        [orderIds]
      );
    }

    // Format orders with items
    const orders = ordersResult.rows.map(order => ({
      id: order.id,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      date: order.date,
      status: order.status,
      total: parseFloat(order.total),
      items: itemsResult.rows
        .filter(item => item.order_id === order.id)
        .map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: parseFloat(item.quantity),
          receivedQuantity: parseFloat(item.received_quantity),
          unit: item.unit,
          pricePerUnit: parseFloat(item.price_per_unit)
        }))
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);

    const order = orderResult.rows[0];
    res.json({
      id: order.id,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      date: order.date,
      status: order.status,
      total: parseFloat(order.total),
      items: itemsResult.rows.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: parseFloat(item.quantity),
        receivedQuantity: parseFloat(item.received_quantity),
        unit: item.unit,
        pricePerUnit: parseFloat(item.price_per_unit)
      }))
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create new order
router.post('/',
  [
    body('id').notEmpty().trim(),
    body('supplierId').notEmpty().trim(),
    body('supplierName').notEmpty().trim(),
    body('items').isArray().notEmpty(),
    body('items.*.productId').notEmpty(),
    body('items.*.productName').notEmpty(),
    body('items.*.quantity').isFloat({ min: 0 }),
    body('items.*.unit').notEmpty(),
    body('items.*.pricePerUnit').isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const { id, supplierId, supplierName, items, status = 'Brouillon' } = req.body;

      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (id, supplier_id, supplier_name, date, status, total)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, supplierId, supplierName, new Date(), status, total]
      );

      // Insert order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, price_per_unit)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, item.productId, item.productName, item.quantity, item.unit, item.pricePerUnit]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        id: orderResult.rows[0].id,
        supplierId: orderResult.rows[0].supplier_id,
        supplierName: orderResult.rows[0].supplier_name,
        date: orderResult.rows[0].date,
        status: orderResult.rows[0].status,
        total: parseFloat(orderResult.rows[0].total),
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          receivedQuantity: 0,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit
        }))
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Order with this ID already exists' });
      }
      res.status(500).json({ error: 'Failed to create order' });
    } finally {
      client.release();
    }
  }
);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status',
  [
    body('status').isIn(['Brouillon', 'Envoyée', 'Confirmée', 'Reçue partiellement', 'Reçue totalement', 'Annulée'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await query(
        `UPDATE orders
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        id: result.rows[0].id,
        status: result.rows[0].status
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
);

// POST /api/orders/:id/receive - Receive order items and update stock
router.post('/:id/receive',
  [
    body('items').isArray().notEmpty(),
    body('items.*.productId').notEmpty(),
    body('items.*.receivedQuantity').isFloat({ min: 0 }),
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
      const { items } = req.body;

      // Check if order exists
      const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Order not found' });
      }

      let allFullyReceived = true;

      // Update each item and stock
      for (const item of items) {
        // Update order item received quantity
        const updateItemResult = await client.query(
          `UPDATE order_items
           SET received_quantity = received_quantity + $1, updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $2 AND product_id = $3
           RETURNING *`,
          [item.receivedQuantity, id, item.productId]
        );

        if (updateItemResult.rows.length === 0) {
          console.warn(`Item not found in order: ${item.productId}`);
          continue;
        }

        const updatedItem = updateItemResult.rows[0];

        // Check if this item is fully received
        if (parseFloat(updatedItem.received_quantity) < parseFloat(updatedItem.quantity)) {
          allFullyReceived = false;
        }

        // Update product stock
        const productResult = await client.query(
          'SELECT current_stock FROM products WHERE id = $1',
          [item.productId]
        );

        if (productResult.rows.length > 0) {
          const previousStock = productResult.rows[0].current_stock;
          const newStock = parseFloat(previousStock) + parseFloat(item.receivedQuantity);

          await client.query(
            `UPDATE products
             SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [newStock, item.productId]
          );

          // Log stock movement
          await client.query(
            `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes)
             VALUES ($1, 'RECEIVE_ORDER', $2, $3, $4, $5, $6)`,
            [
              item.productId,
              item.receivedQuantity,
              previousStock,
              newStock,
              id,
              `Received from order ${id}`
            ]
          );
        }
      }

      // Update order status
      const newStatus = allFullyReceived ? 'Reçue totalement' : 'Reçue partiellement';
      await client.query(
        `UPDATE orders
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newStatus, id]
      );

      await client.query('COMMIT');

      // Fetch updated order
      const updatedOrderResult = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
      const updatedItemsResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [id]);

      const order = updatedOrderResult.rows[0];
      res.json({
        id: order.id,
        supplierId: order.supplier_id,
        supplierName: order.supplier_name,
        date: order.date,
        status: order.status,
        total: parseFloat(order.total),
        items: updatedItemsResult.rows.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: parseFloat(item.quantity),
          receivedQuantity: parseFloat(item.received_quantity),
          unit: item.unit,
          pricePerUnit: parseFloat(item.price_per_unit)
        }))
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error receiving order:', error);
      res.status(500).json({ error: 'Failed to receive order' });
    } finally {
      client.release();
    }
  }
);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// GET /api/orders/stats/monthly-spending - Get monthly spending statistics
router.get('/stats/monthly-spending', async (req, res) => {
  try {
    const result = await query('SELECT * FROM monthly_spending');

    res.json(result.rows.map(row => ({
      month: row.month,
      orderCount: parseInt(row.order_count),
      totalSpent: parseFloat(row.total_spent)
    })));
  } catch (error) {
    console.error('Error fetching monthly spending:', error);
    res.status(500).json({ error: 'Failed to fetch monthly spending' });
  }
});

module.exports = router;
