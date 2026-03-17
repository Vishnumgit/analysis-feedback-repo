-- ============================================================
-- Seed Data - Sample products and QR mappings for testing
-- ============================================================

INSERT INTO products (product_name, description, model_url, texture_url, thumbnail_url, width, height, depth, category, price)
VALUES
  (
    'Modern Lounge Chair',
    'A stylish lounge chair with premium fabric upholstery. Perfect for living rooms.',
    'https://res.cloudinary.com/demo/raw/upload/v1/samples/3d/chair.glb',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/chair_texture.png',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/chair_thumb.jpg',
    0.75, 0.90, 0.80,
    'furniture', 299.99
  ),
  (
    'Oak Dining Table',
    'Solid oak dining table, seats 6 people comfortably. Available in natural and dark stain.',
    'https://res.cloudinary.com/demo/raw/upload/v1/samples/3d/table.glb',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/table_texture.png',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/table_thumb.jpg',
    1.80, 0.76, 0.90,
    'furniture', 799.00
  ),
  (
    'Wireless Noise-Cancelling Headphones',
    'Over-ear headphones with 30-hour battery life and active noise cancellation.',
    'https://res.cloudinary.com/demo/raw/upload/v1/samples/3d/headphones.glb',
    NULL,
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/headphones_thumb.jpg',
    0.20, 0.22, 0.18,
    'electronics', 249.99
  ),
  (
    'Ceramic Table Lamp',
    'Hand-crafted ceramic base with linen shade. Warm ambient lighting.',
    'https://res.cloudinary.com/demo/raw/upload/v1/samples/3d/lamp.glb',
    NULL,
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/lamp_thumb.jpg',
    0.30, 0.55, 0.30,
    'lighting', 89.99
  ),
  (
    'Indoor Succulent Plant',
    'Low-maintenance succulent arrangement in a modern concrete pot.',
    'https://res.cloudinary.com/demo/raw/upload/v1/samples/3d/plant.glb',
    NULL,
    'https://res.cloudinary.com/demo/image/upload/v1/samples/3d/plant_thumb.jpg',
    0.15, 0.25, 0.15,
    'decor', 34.99
  );

-- QR mappings (each QR code points to a product)
INSERT INTO qr_mappings (qr_code, product_id)
VALUES
  ('qr_chair_001',       1),
  ('qr_table_001',       2),
  ('qr_headphones_001',  3),
  ('qr_lamp_001',        4),
  ('qr_plant_001',       5);

-- Sample admin user (password: Admin@123 - bcrypt hash shown for reference only)
-- In production generate this with: bcrypt.hashSync('your_password', 12)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$12$examplehashreplacethiswithrealbcrypthash',
  'admin'
);
