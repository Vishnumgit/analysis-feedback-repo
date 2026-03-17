-- ============================================================
-- QR to 3D AR Hybrid Visualization System
-- Initial Database Schema
-- ============================================================

-- Enable UUID extension (available on most PostgreSQL hosts)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    product_id   SERIAL PRIMARY KEY,
    product_name VARCHAR(255)    NOT NULL,
    description  TEXT,
    model_url    TEXT            NOT NULL,          -- URL to .glb/.gltf file
    texture_url  TEXT,                              -- Optional texture / HDR URL
    thumbnail_url TEXT,                             -- Preview image for listings
    width        FLOAT,                             -- metres
    height       FLOAT,
    depth        FLOAT,
    category     VARCHAR(100),
    price        DECIMAL(10, 2),
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ── qr_mappings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_mappings (
    qr_id          SERIAL PRIMARY KEY,
    qr_code        VARCHAR(500)  UNIQUE NOT NULL,
    product_id     INT           NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    scan_count     INT           NOT NULL DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(100)  UNIQUE NOT NULL,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,           -- bcrypt hash, never plain text
    role          VARCHAR(50)   NOT NULL DEFAULT 'viewer',  -- viewer | admin
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── ar_sessions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ar_sessions (
    session_id   SERIAL PRIMARY KEY,
    qr_id        INT          REFERENCES qr_mappings(qr_id) ON DELETE SET NULL,
    product_id   INT          REFERENCES products(product_id) ON DELETE SET NULL,
    user_id      INT          REFERENCES users(user_id) ON DELETE SET NULL,
    user_agent   TEXT,
    latitude     FLOAT,
    longitude    FLOAT,
    duration_sec INT,                               -- seconds spent in AR
    platform     VARCHAR(50),                       -- e.g. 'web' | 'mobile'
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_qr_mappings_qr_code    ON qr_mappings(qr_code);
CREATE INDEX IF NOT EXISTS idx_qr_mappings_product_id ON qr_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category      ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_product_id ON ar_sessions(product_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_created_at ON ar_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email            ON users(email);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
