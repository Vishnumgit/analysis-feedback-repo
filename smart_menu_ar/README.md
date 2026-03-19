# Smart Menu 3D AR - Backend API

Node.js/Express backend powering the Smart Menu 3D AR system, deployed on **Render** (free tier).

**Backend URL:** `https://analysis-feedback-repo.onrender.com`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all products (optional `?category=mains&page=1&limit=20`) |
| GET | `/api/products/:productId` | Get product by ID |
| POST | `/api/products` | Create a new product |
| GET | `/api/qr/:qrCode` | Look up product by QR code / slug |
| POST | `/api/qr/:qrCode/scan` | Record a scan event |
| POST | `/api/analytics/session` | Log an AR viewing session |
| GET | `/api/analytics/product/:productId` | Get aggregated analytics for a product |

## Tech

- **Node.js 18+** + **Express**
- **PostgreSQL** (Supabase) for product catalog & analytics storage
- Falls back to **in-memory mock data** when `DATABASE_URL` is not set
- Deployed on **Render** (free tier)

## Setup

See `backend/` directory for the full source code and `docs/DEPLOYMENT_GUIDE.md` for deployment instructions.
