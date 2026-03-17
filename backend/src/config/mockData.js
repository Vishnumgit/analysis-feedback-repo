'use strict';

const MOCK_PRODUCTS = [
  {
    product_id: 1,
    product_name: 'Modern Chair',
    description: 'Sleek ergonomic chair',
    model_url: 'https://example.com/chair.glb',
    texture_url: 'https://example.com/chair-texture.png',
    width: 0.5,
    height: 1.2,
    depth: 0.5,
    category: 'furniture',
    price: 299.99,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    product_id: 2,
    product_name: 'Wooden Table',
    description: 'Beautiful wooden table',
    model_url: 'https://example.com/table.glb',
    texture_url: 'https://example.com/table-texture.png',
    width: 1.0,
    height: 0.7,
    depth: 1.0,
    category: 'furniture',
    price: 599.99,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    product_id: 3,
    product_name: 'Desk Lamp',
    description: 'LED desk lamp',
    model_url: 'https://example.com/lamp.glb',
    texture_url: 'https://example.com/lamp-texture.png',
    width: 0.3,
    height: 0.4,
    depth: 0.3,
    category: 'lighting',
    price: 49.99,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  },
];

// In-memory scan counts – mutated by POST /api/qr/:qrCode/scan
const MOCK_QR_MAPPINGS = [
  { qr_id: 1, qr_code: 'QR_CHAIR_001', product_id: 1, scan_count: 0 },
  { qr_id: 2, qr_code: 'QR_TABLE_001', product_id: 2, scan_count: 0 },
  { qr_id: 3, qr_code: 'QR_LAMP_001',  product_id: 3, scan_count: 0 },
];

module.exports = { MOCK_PRODUCTS, MOCK_QR_MAPPINGS };
