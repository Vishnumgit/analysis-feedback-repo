# Local Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Docker & Docker Compose | ≥ 24 (optional but recommended) |
| Git | any recent version |

---

## Option A – Docker (Recommended)

The fastest way to run everything locally.

```bash
# 1. Clone
git clone https://github.com/Vishnumgit/analysis-feedback-repo.git
cd analysis-feedback-repo

# 2. Copy environment template
cp backend/.env.example backend/.env
# Edit backend/.env and set CLOUDINARY_* and JWT_SECRET

# 3. Start all services (db + backend + web)
docker compose up --build

# Services available at:
# API:      http://localhost:3000/api/health
# Frontend: http://localhost:5173
# DB:       localhost:5432  (postgres / postgres)
```

---

## Option B – Manual Setup

### 1. Database (PostgreSQL)

Use [Supabase](https://supabase.com) (free) or a local PostgreSQL instance.

**Supabase:**
1. Sign up at https://supabase.com using GitHub
2. Create project → **qr-3d-ar**
3. Open **SQL Editor**, paste `database/001_init_schema.sql`, click **Run**
4. Paste `database/seed_data.sql` and run it
5. Go to **Settings → Database → Connection string** → copy the URI

**Local PostgreSQL:**
```bash
createdb qr_3d_ar
psql qr_3d_ar < database/001_init_schema.sql
psql qr_3d_ar < database/seed_data.sql
```

### 2. Backend

```bash
cd backend
npm install

# Create .env from template
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_* values

# Start dev server (auto-restarts on changes)
npm run dev
# → http://localhost:3000/api/health
```

### 3. Frontend

```bash
cd web
npm install
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173` in your browser. To test QR lookup:
```
http://localhost:5173/?qr=qr_chair_001
```

---

## Verifying the Setup

```bash
# Health check
curl http://localhost:3000/api/health

# List products
curl http://localhost:3000/api/products

# QR lookup (uses seed data)
curl http://localhost:3000/api/qr/qr_chair_001
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | – | API port (default `3000`) |
| `JWT_SECRET` | ✅ | Random secret ≥ 32 chars |
| `CLOUDINARY_CLOUD_NAME` | – | For 3D asset hosting |
| `CLOUDINARY_API_KEY` | – | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | – | Cloudinary API secret |
| `ALLOWED_ORIGINS` | – | Comma-separated CORS origins |
