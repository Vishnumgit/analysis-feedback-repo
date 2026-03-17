'use strict';

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const pool = require('../config/database');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/analytics/session
 * Log an AR viewing session for a product.
 *
 * Body: { product_id, platform, duration, user_agent? }
 */
router.post(
  '/session',
  [
    body('product_id').isInt({ min: 1 }).toInt(),
    body('platform').optional().trim().isLength({ max: 50 }),
    body('duration').optional().isInt({ min: 0 }).toInt(),
  ],
  validate,
  async (req, res) => {
    try {
      const { product_id, platform, duration, user_agent } = req.body;

      // Verify product exists before logging session
      const productCheck = await pool.query(
        'SELECT product_id FROM products WHERE product_id = $1',
        [product_id]
      );
      if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const result = await pool.query(
        `INSERT INTO ar_sessions (product_id, platform, duration_sec, user_agent)
         VALUES ($1, $2, $3, $4)
         RETURNING session_id, product_id, platform, duration_sec AS duration, created_at AS logged_at`,
        [product_id, platform || null, duration != null ? duration : null, user_agent || null]
      );

      const row = result.rows[0];
      res.json({
        session_id: `session_${row.session_id}`,
        product_id: row.product_id,
        platform:   row.platform,
        duration:   row.duration,
        logged_at:  row.logged_at,
      });
    } catch (err) {
      console.error('POST /api/analytics/session error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/analytics/product/:productId
 * Return aggregated analytics for a product.
 *
 * Query: ?days=30  (default 30, max 365)
 */
router.get(
  '/product/:productId',
  [
    param('productId').isInt({ min: 1 }).toInt(),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  validate,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const days = req.query.days || 30;

      // Verify product exists
      const productCheck = await pool.query(
        'SELECT product_id FROM products WHERE product_id = $1',
        [productId]
      );
      if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Aggregate session stats
      const sessionStats = await pool.query(
        `SELECT
           COUNT(*)                              AS total_views,
           COALESCE(AVG(duration_sec), 0)        AS avg_session_duration,
           COUNT(DISTINCT user_agent)            AS unique_users
         FROM ar_sessions
         WHERE product_id = $1
           AND created_at >= NOW() - ($2 || ' days')::INTERVAL`,
        [productId, days]
      );

      // Aggregate QR scan count
      const scanStats = await pool.query(
        `SELECT COALESCE(SUM(scan_count), 0) AS total_qr_scans
         FROM qr_mappings
         WHERE product_id = $1`,
        [productId]
      );

      const views     = parseInt(sessionStats.rows[0].total_views, 10);
      const qrScans   = parseInt(scanStats.rows[0].total_qr_scans, 10);
      const uniqueUsers = parseInt(sessionStats.rows[0].unique_users, 10);
      const avgDuration = parseFloat(sessionStats.rows[0].avg_session_duration) || 0;

      res.json({
        product_id:           productId,
        total_views:          views,
        total_qr_scans:       qrScans,
        avg_session_duration: Math.round(avgDuration),
        unique_users:         uniqueUsers,
        conversion_rate:      views > 0 ? parseFloat((uniqueUsers / views).toFixed(3)) : 0,
        period_days:          days,
      });
    } catch (err) {
      console.error('GET /api/analytics/product/:productId error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
