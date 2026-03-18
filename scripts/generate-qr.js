#!/usr/bin/env node
/**
 * Generate QR codes for each menu item.
 *
 * Usage:
 *   npm run generate:qr      (from the web/ directory)
 *
 * Configuration:
 *   - QR_BASE_URL: override the base URL for the QR content.
 *     Defaults to the deployed viewer:
 *     https://analysis-feedback-repo-git-copilot-896c0c-vishnumgits-projects.vercel.app/#/i/
 */
const fs = require('fs');
const path = require('path');

function loadQRCodeLib() {
  try {
    return require('qrcode');
  } catch (_err) {
    // Fallback when dependencies are installed inside web/node_modules
    return require(path.resolve(__dirname, '../web/node_modules/qrcode'));
  }
}

const QRCode = loadQRCodeLib();

const DEFAULT_BASE =
  'https://analysis-feedback-repo-git-copilot-896c0c-vishnumgits-projects.vercel.app/#/i/';

const BASE_URL = (process.env.QR_BASE_URL || DEFAULT_BASE).replace(/\/?$/, '/');
const ITEMS_PATH = path.resolve(__dirname, '../web/public/items.json');
const OUTPUT_DIR = path.resolve(__dirname, '../web/public/qr');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadItems() {
  const raw = fs.readFileSync(ITEMS_PATH, 'utf8');
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    throw new Error('items.json must contain an array');
  }
  return items;
}

async function generate() {
  ensureDir(OUTPUT_DIR);
  const items = loadItems();

  for (const item of items) {
    if (!item.slug) continue;
    const target = `${BASE_URL}${item.slug}`;
    const outPath = path.join(OUTPUT_DIR, `${item.slug}.png`);

    await QRCode.toFile(outPath, target, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    console.log(`✅ ${item.slug} → ${target}`);
  }

  console.log(`\nDone! QR codes saved to ${OUTPUT_DIR}`);
}

generate().catch((err) => {
  console.error('Failed to generate QR codes:', err);
  process.exit(1);
});
