const express = require('express');
const pool = require('../config/database');
const router = express.Router();

/**
 * GET /api/qr/:qrCode
 * Look up the product associated with a QR code and return its data
 * including the 3D model URL ready for the WebAR viewer.
 */
router.get('/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;

    const result = await pool.query(
      `SELECT
         p.product_id,
         p.product_name,
         p.description,
         p.model_url,
         p.texture_url,
         p.width,
         p.height,
         p.depth,
         p.category,
         p.price,
         q.qr_id,
         q.scan_count
       FROM products p
       INNER JOIN qr_mappings q ON p.product_id = q.product_id
       WHERE q.qr_code = $1`,
      [qrCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('GET /api/qr/:qrCode error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/qr/:qrCode/scan
 * Record a scan event for analytics.
 */
router.post('/:qrCode/scan', async (req, res) => {
  try {
    const { qrCode } = req.params;
    const { user_agent, latitude, longitude } = req.body;

    // Increment scan counter
    const updateResult = await pool.query(
      `UPDATE qr_mappings
         SET scan_count = scan_count + 1,
             last_scanned_at = NOW()
       WHERE qr_code = $1
       RETURNING qr_id, product_id`,
      [qrCode]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const { qr_id, product_id } = updateResult.rows[0];

    // Record session analytics
    await pool.query(
      `INSERT INTO ar_sessions (qr_id, product_id, user_agent, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)`,
      [qr_id, product_id, user_agent || null, latitude || null, longitude || null]
    );

    res.json({ success: true, message: 'Scan recorded' });
  } catch (err) {
    console.error('POST /api/qr/:qrCode/scan error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
