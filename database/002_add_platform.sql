-- ============================================================
-- Migration 002: Add platform column to ar_sessions
-- ============================================================

ALTER TABLE ar_sessions
  ADD COLUMN IF NOT EXISTS platform VARCHAR(50);
