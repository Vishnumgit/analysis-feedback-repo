#!/usr/bin/env bash
# verify-deployment.sh – verify that the production deployment is healthy
# Usage: bash scripts/verify-deployment.sh [base_url]

set -euo pipefail

BASE_URL="${1:-https://analysis-feedback-repo.onrender.com}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass()  { echo -e "${GREEN}✓${NC}  $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
fail()  { echo -e "${RED}✗${NC}  $1"; ERRORS=$((ERRORS + 1)); }
ERRORS=0

echo "================================================"
echo " Deployment verification"
echo " URL: ${BASE_URL}"
echo "================================================"

# 1. Health endpoint
echo ""
echo "── Health check ──────────────────────────────"
BODY=$(curl -sf "${BASE_URL}/api/health" 2>/dev/null) && {
  echo "   Response: ${BODY}"
  pass "Health endpoint reachable"
} || fail "Health endpoint not reachable at ${BASE_URL}/api/health"

# 2. Products endpoint
echo ""
echo "── Products endpoint ─────────────────────────"
STATUS=$(curl -s -o /tmp/vd_products.json -w "%{http_code}" \
  "${BASE_URL}/api/products" 2>/dev/null) || STATUS="000"
if [ "$STATUS" -eq 200 ] 2>/dev/null; then
  TOTAL=$(python3 -c "import json; d=json.load(open('/tmp/vd_products.json')); print(d.get('pagination',{}).get('total','?'))" 2>/dev/null || echo "?")
  pass "GET /api/products → 200 (total products: ${TOTAL})"
else
  fail "GET /api/products returned HTTP ${STATUS}"
fi

# 3. HTTPS check
echo ""
echo "── HTTPS check ───────────────────────────────"
if [[ "${BASE_URL}" == https://* ]]; then
  pass "URL uses HTTPS"
else
  warn "URL does not use HTTPS – not suitable for production"
fi

# 4. CORS header present
echo ""
echo "── CORS headers ──────────────────────────────"
CORS=$(curl -sI "${BASE_URL}/api/health" 2>/dev/null | grep -i "access-control-allow-origin" || true)
if [ -n "$CORS" ]; then
  pass "CORS header present: ${CORS}"
else
  warn "No Access-Control-Allow-Origin header detected"
fi

# 5. No old/wrong URL in code files
echo ""
echo "── URL consistency ───────────────────────────"
OLD_URL="qr-3d-ar-backend.onrender.com"
if grep -r "$OLD_URL" . \
    --include="*.js" --include="*.html" --include="*.json" --include="*.example" \
    --exclude-dir=.git -q 2>/dev/null; then
  fail "Old URL ${OLD_URL} still found in code files"
else
  pass "No references to old URL ${OLD_URL} found in code files"
fi

# Summary
echo ""
echo "================================================"
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}Deployment verification passed.${NC}"
else
  echo -e "${RED}${ERRORS} check(s) failed. Review output above.${NC}"
  exit 1
fi
