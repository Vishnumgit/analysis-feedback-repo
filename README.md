# QR to 3D AR Hybrid Visualization System

Scan a QR code → view the linked product as an interactive 3D model in your browser (WebAR).

## Architecture

```
Browser (WebAR)  →  Express API (Render)  →  PostgreSQL (Supabase)
       ↑
  QR code scan
```

## Quick Start (Docker)

```bash
git clone https://github.com/Vishnumgit/analysis-feedback-repo.git
cd analysis-feedback-repo
cp backend/.env.example backend/.env   # fill in values
docker compose up --build
```

| Service  | URL                               |
|----------|-----------------------------------|
| API      | http://localhost:3000/api/health  |
| Frontend | http://localhost:5173             |
| Database | localhost:5432                    |

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step instructions to deploy on:

- **Database** – Supabase (free tier)
- **Backend API** – Render (free tier)
- **Frontend** – Vercel (free tier)

## API Reference

See [docs/API.md](docs/API.md) for all endpoints.

Key endpoints:

| Method | Path                           | Description             |
|--------|--------------------------------|-------------------------|
| GET    | /api/health                    | Server health check     |
| GET    | /api/products                  | List products           |
| GET    | /api/products/:id              | Get product by ID       |
| GET    | /api/qr/:qrCode                | Look up QR code         |
| POST   | /api/qr/:qrCode/scan           | Record a scan event     |
| POST   | /api/analytics/session         | Log an AR session       |

## Project Structure

```
├── backend/                  Express.js API
│   ├── src/
│   │   ├── server.js         Entry point
│   │   ├── config/database.js
│   │   └── routes/
│   │       ├── qr.js
│   │       ├── products.js
│   │       └── analytics.js
│   ├── Dockerfile
│   └── package.json
├── web/                      WebAR frontend
│   ├── index.html
│   ├── main.js               Three.js viewer + API helpers
│   └── package.json
├── database/
│   ├── 001_init_schema.sql   Table definitions
│   └── seed_data.sql         Sample products & QR codes
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
└── docker-compose.yml
```

## Local Development

See [docs/SETUP.md](docs/SETUP.md) for detailed instructions.

## License

MIT
