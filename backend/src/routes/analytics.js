'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
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
 * Log an AR session event.
 *
 * Body:
 *   product_id  {number}  required
 *   platform    {string}  optional  e.g. "web" | "mobile"
 *   duration    {number}  optional  seconds spent in AR
 *   user_agent  {string}  optional
 *   latitude    {number}  optional
 *   longitude   {number}  optional
 */
router.post(
  '/session',
  [
    body('product_id').isInt({ min: 1 }).toInt(),
    body('platform').optional().isString().trim().isLength({ max: 50 }),
    body('duration').optional().isFloat({ min: 0 }).toFloat(),
    body('user_agent').optional().isString().trim().isLength({ max: 500 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  validate,
  async (req, res) => {
    try {
      const { product_id, platform, duration, user_agent, latitude, longitude } = req.body;

      const result = await pool.query(
        `INSERT INTO ar_sessions (product_id, user_agent, latitude, longitude, duration_sec, platform)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING session_id, product_id, platform, created_at`,
        [
          product_id,
          user_agent || null,
          latitude   || null,
          longitude  || null,
          duration != null ? Math.round(duration) : null,
          platform   || null,
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (err) {
      console.error('POST /api/analytics/session error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
