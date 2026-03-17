const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const db = require('../config/database');
const { MOCK_PRODUCTS } = require('../config/mockData');
const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

/**
 * GET /api/products
 * List products with optional category filter and pagination.
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString().trim().escape(),
  ],
  validate,
  async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const offset = (page - 1) * limit;
      const category = req.query.category;

      if (!db.dbAvailable || !db.pool) {
        let data = MOCK_PRODUCTS;
        if (category) data = data.filter((p) => p.category === category);
        const total = data.length;
        const paged = data.slice(offset, offset + limit);
        return res.json({
          data: paged,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
          source: 'mock_data',
        });
      }

      let queryText =
        'SELECT product_id, product_name, description, model_url, texture_url, width, height, depth, category, price, created_at FROM products';
      const params = [];

      if (category) {
        queryText += ' WHERE category = $1';
        params.push(category);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.pool.query(queryText, params);

      // Total count for pagination
      const countQuery = category
        ? 'SELECT COUNT(*) FROM products WHERE category = $1'
        : 'SELECT COUNT(*) FROM products';
      const countResult = await db.pool.query(countQuery, category ? [category] : []);
      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        data: result.rows,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error('GET /api/products error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/products/:productId
 * Get a single product by its ID.
 */
router.get(
  '/:productId',
  [param('productId').isInt({ min: 1 }).toInt()],
  validate,
  async (req, res) => {
    try {
      if (!db.dbAvailable || !db.pool) {
        const product = MOCK_PRODUCTS.find((p) => p.product_id === req.params.productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        return res.json({ data: product, source: 'mock_data' });
      }

      const result = await db.pool.query(
        'SELECT * FROM products WHERE product_id = $1',
        [req.params.productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ data: result.rows[0] });
    } catch (err) {
      console.error('GET /api/products/:productId error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/products
 * Create a new product (admin use).
 */
router.post(
  '/',
  [
    body('product_name').notEmpty().trim().isLength({ max: 255 }),
    body('model_url').notEmpty().isURL(),
    body('texture_url').optional().isURL(),
    body('category').optional().trim().isLength({ max: 100 }),
    body('price').optional().isFloat({ min: 0 }),
    body('width').optional().isFloat({ min: 0 }),
    body('height').optional().isFloat({ min: 0 }),
    body('depth').optional().isFloat({ min: 0 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { product_name, description, model_url, texture_url, width, height, depth, category, price } =
        req.body;

      if (!db.dbAvailable || !db.pool) {
        // Assign a unique ID using max existing id + 1 to avoid collisions
        const maxId = MOCK_PRODUCTS.reduce((m, p) => Math.max(m, p.product_id), 0);
        const newProduct = {
          product_id: maxId + 1,
          product_name,
          description: description || null,
          model_url,
          texture_url: texture_url || null,
          width: width || null,
          height: height || null,
          depth: depth || null,
          category: category || null,
          price: price || null,
          created_at: new Date(),
        };
        MOCK_PRODUCTS.push(newProduct);
        return res.status(201).json({ data: newProduct, source: 'mock_data' });
      }

      const result = await db.pool.query(
        `INSERT INTO products (product_name, description, model_url, texture_url, width, height, depth, category, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [product_name, description || null, model_url, texture_url || null, width || null, height || null, depth || null, category || null, price || null]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      console.error('POST /api/products error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
