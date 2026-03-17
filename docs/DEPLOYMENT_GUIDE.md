# Deployment Guide

## Production URLs

| Service | URL |
|---------|-----|
| **Backend API** | https://analysis-feedback-repo.onrender.com |
| **Health Check** | https://analysis-feedback-repo.onrender.com/api/health |
| **Products** | https://analysis-feedback-repo.onrender.com/api/products |

---

## Backend – Render

1. Go to https://render.com → **New Web Service**
2. Connect the repository `Vishnumgit/analysis-feedback-repo`
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables** (from `backend/.env.example`):
   - `DATABASE_URL` – Supabase connection string
   - `NODE_ENV=production`
   - `JWT_SECRET` – random 32+ char string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `ALLOWED_ORIGINS` – your Vercel frontend URL
   - `API_BASE_URL=https://analysis-feedback-repo.onrender.com`
5. Click **Deploy**

---

## Frontend – Vercel

1. Go to https://vercel.com → **New Project**
2. Import `Vishnumgit/analysis-feedback-repo`
3. Settings:
   - **Root Directory:** `web`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable:**
   - `VITE_API_URL=https://analysis-feedback-repo.onrender.com`
5. Click **Deploy**

---

## Database – Supabase

1. Create project at https://supabase.com
2. **SQL Editor** → run `database/001_init_schema.sql`
3. **SQL Editor** → run `database/seed_data.sql`
4. Copy **Settings → Database → Connection string** into `DATABASE_URL`

---

## Quick Health Check

```bash
# Verify backend is live
curl https://analysis-feedback-repo.onrender.com/api/health
# Expected: {"status":"ok","timestamp":"..."}

# List products
curl https://analysis-feedback-repo.onrender.com/api/products
# Expected: {"data":[...],"pagination":{...}}

# Test QR lookup
curl https://analysis-feedback-repo.onrender.com/api/qr/qr_chair_001
```

---

## Environment Variables Reference

```env
# Production backend URL
API_BASE_URL=https://analysis-feedback-repo.onrender.com
VITE_API_URL=https://analysis-feedback-repo.onrender.com
```

---

## Production Checklist

- [ ] `NODE_ENV=production` is set on Render
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] `JWT_SECRET` is a strong random string (≥ 32 chars)
- [ ] `ALLOWED_ORIGINS` matches exact frontend domain
- [ ] `API_BASE_URL=https://analysis-feedback-repo.onrender.com` is set
- [ ] `VITE_API_URL=https://analysis-feedback-repo.onrender.com` is set on Vercel
- [ ] Health check returns `{"status":"ok"}`
- [ ] No references to old URL `qr-3d-ar-backend.onrender.com` remain
- [ ] HTTPS enforced on all domains
- [ ] Database backups enabled
