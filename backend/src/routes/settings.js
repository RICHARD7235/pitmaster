const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET /api/settings - Get application settings
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM app_settings ORDER BY id DESC LIMIT 1');

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        provider: 'gemini',
        aiModel: 'gemini-2.5-flash',
        apiKey: '',
        geminiApiKey: '',
        openaiApiKey: '',
        anthropicApiKey: ''
      });
    }

    const settings = result.rows[0];
    res.json({
      provider: settings.provider,
      aiModel: settings.ai_model,
      apiKey: settings.api_key || '',
      geminiApiKey: settings.gemini_api_key || '',
      openaiApiKey: settings.openai_api_key || '',
      anthropicApiKey: settings.anthropic_api_key || ''
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update application settings
router.put('/',
  [
    body('provider').isIn(['gemini', 'openai', 'anthropic']),
    body('aiModel').notEmpty(),
    body('apiKey').optional(),
    body('geminiApiKey').optional(),
    body('openaiApiKey').optional(),
    body('anthropicApiKey').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        provider,
        aiModel,
        apiKey,
        geminiApiKey,
        openaiApiKey,
        anthropicApiKey
      } = req.body;

      // Check if settings exist
      const existingResult = await query('SELECT id FROM app_settings LIMIT 1');

      let result;
      if (existingResult.rows.length === 0) {
        // Insert new settings
        result = await query(
          `INSERT INTO app_settings (provider, ai_model, api_key, gemini_api_key, openai_api_key, anthropic_api_key)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [provider, aiModel, apiKey, geminiApiKey, openaiApiKey, anthropicApiKey]
        );
      } else {
        // Update existing settings
        result = await query(
          `UPDATE app_settings
           SET provider = $1,
               ai_model = $2,
               api_key = COALESCE($3, api_key),
               gemini_api_key = COALESCE($4, gemini_api_key),
               openai_api_key = COALESCE($5, openai_api_key),
               anthropic_api_key = COALESCE($6, anthropic_api_key),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $7
           RETURNING *`,
          [provider, aiModel, apiKey, geminiApiKey, openaiApiKey, anthropicApiKey, existingResult.rows[0].id]
        );
      }

      const settings = result.rows[0];
      res.json({
        provider: settings.provider,
        aiModel: settings.ai_model,
        apiKey: settings.api_key || '',
        geminiApiKey: settings.gemini_api_key || '',
        openaiApiKey: settings.openai_api_key || '',
        anthropicApiKey: settings.anthropic_api_key || ''
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
);

// GET /api/settings/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM low_stock_products) as low_stock_count,
        (SELECT COUNT(*) FROM orders WHERE status IN ('Envoyée', 'Confirmée')) as active_orders,
        (SELECT COUNT(*) FROM suppliers) as active_suppliers,
        (SELECT COALESCE(SUM(total), 0) FROM orders
         WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
         AND status NOT IN ('Annulée', 'Brouillon')) as monthly_spending,
        (SELECT COALESCE(SUM(current_stock * average_cost), 0) FROM products) as total_stock_value
    `);

    const stats = result.rows[0];
    res.json({
      lowStockCount: parseInt(stats.low_stock_count),
      activeOrders: parseInt(stats.active_orders),
      activeSuppliers: parseInt(stats.active_suppliers),
      monthlySpending: parseFloat(stats.monthly_spending),
      totalStockValue: parseFloat(stats.total_stock_value)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
