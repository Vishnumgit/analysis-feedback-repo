# Deployment Instructions

## Architecture Overview

```
Internet → CDN/Edge (Vercel/Netlify)
                ↓
        Frontend (web/)          ← static files
                ↓
        Backend API (backend/)   ← Node.js on Render/Railway
                ↓
        PostgreSQL               ← Supabase / managed DB
```

---

## 1. Database—Supabase (Free tier)

1. Create project at https://supabase.com
2. **SQL Editor** → run `database/001_init_schema.sql`
3. **SQL Editor** → run `database/seed_data.sql`
4. Copy connection string from **Settings → Database**

---

## 2. Backend—Render (Free tier)

1. Push code to GitHub (already done)
2. Go to https://render.com → **New Web Service**
3. Connect your repository
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add **Environment Variables** (from `backend/.env.example`):
   - `DATABASE_URL` – Supabase connection string
   - `NODE_ENV` – `production`
   - `JWT_SECRET` – random 32+ char string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `ALLOWED_ORIGINS` – your frontend URL (e.g. `https://myapp.vercel.app`)
6. Deploy → note the service URL (e.g. `https://qr-ar-api.onrender.com`)

---

## 3. Frontend—Vercel (Free tier)

1. Go to https://vercel.com → **New Project**
2. Import your GitHub repository
3. Settings:
   - **Root Directory:** `web`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable:**
   - `VITE_API_BASE` = your Render backend URL
5. In `web/index.html` update `API_BASE`:
   ```js
   const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
   ```
6. Deploy

---

## 4. Alternative—Railway (one-click)

Railway can host both backend and PostgreSQL together:

1. Visit https://railway.app → **New Project**
2. **Deploy from GitHub** → select repo
3. Add a **PostgreSQL** service
4. Set the same environment variables as for Render
5. Railway auto-detects `Procfile` or `npm start`

---

## 5. Production Checklist

- [ ] `NODE_ENV=production` is set
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] `JWT_SECRET` is a strong random string (≥ 32 chars)
- [ ] `ALLOWED_ORIGINS` is set to your exact frontend domain
- [ ] Cloudinary credentials configured
- [ ] Rate limiting values reviewed for production traffic
- [ ] HTTPS enforced on all domains
- [ ] Database backups enabled (Supabase has automatic daily backups)

---

## 6. Health Check

After deploying:

```bash
curl https://your-api.onrender.com/api/health
# Expected: { "status": "ok", "timestamp": "…" }

curl https://your-api.onrender.com/api/products
# Expected: { "data": [...], "pagination": { … } }
```
