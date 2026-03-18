# QR to 3D AR Hybrid Visualization System

A hybrid web & mobile AR system for instant 3D product visualization via QR codes.

## 💡 Main Idea

The core idea of this project is to bridge the gap between physical products and digital 3D experiences using QR codes and Augmented Reality (AR):

1. **Each product is assigned a unique QR code.** Retailers or manufacturers attach these QR codes to physical items, packaging, or catalogues.
2. **Users scan the QR code** with any smartphone browser (no app download required).
3. **The system fetches the matching 3D model** from the backend API and renders it instantly in the browser using Three.js and WebXR.
4. **Users can view the product in AR**, placing the 3D model into their real environment via their phone camera, or inspect it in an interactive 3D viewer on desktop.

In short: **scan a QR code → see the product as a live 3D / AR object**. The goal is to enhance online and in-store shopping by letting customers explore products in three dimensions before purchasing.

## 🚀 Live URLs

| Service | URL |
|---------|-----|
| **Backend API** | https://analysis-feedback-repo.onrender.com |
| **Health check** | https://analysis-feedback-repo.onrender.com/api/health |
| **Products API** | https://analysis-feedback-repo.onrender.com/api/products |

## 🧩 Quick Test

```bash
curl https://analysis-feedback-repo.onrender.com/api/health
# {"status":"ok","timestamp":"..."}

curl https://analysis-feedback-repo.onrender.com/api/products
# {"data":[...],"pagination":{...}}
```

## 🗂️ Project Structure

```
├── backend/          Node.js + Express API
├── web/              WebAR frontend (Three.js)
├── database/         SQL migrations & seed data
├── docs/             API, Deployment & Setup guides
├── scripts/          Test & verification helper scripts
└── docker-compose.yml
```

## 📚 Documentation

- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Setup Guide](./docs/SETUP.md)
- [Project Plan](./PROJECT-PLAN.md)

## 🔧 Local Development

```bash
# Clone
git clone https://github.com/Vishnumgit/analysis-feedback-repo.git
cd analysis-feedback-repo

# Backend
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend (separate terminal)
cd web && npm install && npm run dev
```

## 🌐 Environment Variables

```env
API_BASE_URL=https://analysis-feedback-repo.onrender.com
VITE_API_URL=https://analysis-feedback-repo.onrender.com
```

## 🔗 Resources

- [Supabase](https://supabase.com) – database
- [Render](https://render.com) – backend hosting
- [Vercel](https://vercel.com) – frontend hosting
- [Three.js](https://threejs.org) – 3D engine
