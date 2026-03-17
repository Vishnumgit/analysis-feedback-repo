#!/usr/bin/env bash
# test-api.sh – smoke-test the production API endpoints
# Usage: bash scripts/test-api.sh [base_url]

set -euo pipefail

BASE_URL="${1:-https://analysis-feedback-repo.onrender.com}"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ PASS${NC}  $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}  $1"; FAILED=$((FAILED + 1)); }
FAILED=0

curl_status() {
  local out; out=$(curl -s -o "${2:-/dev/null}" -w "%{http_code}" "$1" 2>/dev/null) || out="000"
  echo "$out"
}

echo "Testing API at: ${BASE_URL}"
echo "-------------------------------------------"

# 1. Health check
STATUS=$(curl_status "${BASE_URL}/api/health" /tmp/health.json)
if [ "$STATUS" -eq 200 ] 2>/dev/null; then
  pass "GET /api/health → HTTP 200"
else
  fail "GET /api/health → HTTP ${STATUS}"
fi

# 2. Products list
STATUS=$(curl_status "${BASE_URL}/api/products" /tmp/products.json)
if [ "$STATUS" -eq 200 ] 2>/dev/null; then
  pass "GET /api/products → HTTP 200"
else
  fail "GET /api/products → HTTP ${STATUS}"
fi

# 3. Products pagination
STATUS=$(curl_status "${BASE_URL}/api/products?page=1&limit=5")
if [ "$STATUS" -eq 200 ] 2>/dev/null; then
  pass "GET /api/products?page=1&limit=5 → HTTP 200"
else
  fail "GET /api/products?page=1&limit=5 → HTTP ${STATUS}"
fi

# 4. QR lookup – existing code (200 or 404 are both acceptable)
STATUS=$(curl_status "${BASE_URL}/api/qr/qr_chair_001")
if [ "$STATUS" -eq 200 ] 2>/dev/null || [ "$STATUS" -eq 404 ] 2>/dev/null; then
  pass "GET /api/qr/qr_chair_001 → HTTP ${STATUS}"
else
  fail "GET /api/qr/qr_chair_001 → HTTP ${STATUS}"
fi

# 5. QR lookup – unknown code must be 404
STATUS=$(curl_status "${BASE_URL}/api/qr/nonexistent_qr_xyz")
if [ "$STATUS" -eq 404 ] 2>/dev/null; then
  pass "GET /api/qr/nonexistent_qr_xyz → HTTP 404 (expected)"
else
  fail "GET /api/qr/nonexistent_qr_xyz → HTTP ${STATUS} (expected 404)"
fi

# 6. POST scan event
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"user_agent":"test-runner"}' \
  "${BASE_URL}/api/qr/qr_chair_001/scan" 2>/dev/null) || STATUS="000"
if [ "$STATUS" -eq 200 ] 2>/dev/null || [ "$STATUS" -eq 404 ] 2>/dev/null; then
  pass "POST /api/qr/qr_chair_001/scan → HTTP ${STATUS}"
else
  fail "POST /api/qr/qr_chair_001/scan → HTTP ${STATUS}"
fi

echo "-------------------------------------------"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}All tests passed.${NC}"
else
  echo -e "${RED}${FAILED} test(s) failed.${NC}"
  exit 1
fi
