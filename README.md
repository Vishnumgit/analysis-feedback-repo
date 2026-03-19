# Smart Menu 3D AR System

A complete QR-to-3D AR smart menu system for restaurants. Customers scan QR codes to instantly view food items as interactive 3D models on their phones.

## Live Demo

| App | URL |
|-----|-----|
| **QR Generator** (Staff) | [vishnumgit.github.io/analysis-feedback-repo](https://vishnumgit.github.io/analysis-feedback-repo/) |
| **3D AR Viewer** (Customer) | [vishnumgit.github.io/analysis-feedback-repo/viewer.html](https://vishnumgit.github.io/analysis-feedback-repo/viewer.html) |
| **Backend API** | [analysis-feedback-repo.onrender.com](https://analysis-feedback-repo.onrender.com) |

## How It Works

```
Restaurant Staff                    Customer
     |                                  |
     v                                  |
[QR Generator App]                      |
  Browse menu items                     |
  Click "Generate QR"                   |
  Print/display QR code                 |
     |                                  |
     +--- QR Code on table/menu ------> |
                                        v
                                  [Scans QR Code]
                                        |
                                        v
                                  [3D AR Viewer App]
                                    See food in 3D
                                    Rotate & zoom
                                    View in AR
                                    Nutrition info
```

## Menu Items

| Item | Price | Category |
|------|-------|----------|
| Classic Burger | $8.99 | Mains |
| Margherita Pizza | $12.99 | Mains |
| Caesar Salad | $7.49 | Starters |
| Chocolate Lava Cake | $6.99 | Desserts |
| Grilled Chicken Wings | $9.49 | Starters |
| Iced Matcha Latte | $4.99 | Drinks |

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend API** | Node.js, Express, PostgreSQL (Supabase), deployed on Render |
| **QR Generator App** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **3D AR Viewer App** | Next.js 16, Google model-viewer, WebXR |
| **GitHub Pages Version** | Pure HTML/CSS/JS, QRCode.js, model-viewer |

## Project Structure

```
docs/                        <- GitHub Pages (static site)
  index.html                 <- QR Generator page
  viewer.html                <- 3D AR Viewer page

smart_menu_ar/               <- Backend documentation
  README.md                  <- Backend API documentation

backend/                     <- Node.js/Express backend (deploy to Render)
  src/
    server.js
    routes/
    config/
```

## Features

- Browse menu items with category filters and search
- Generate QR codes for any menu item
- Interactive 3D model viewer with rotate/zoom
- AR mode to view food in your real environment
- Nutrition information display
- Analytics tracking for views and scans
- Responsive design for mobile and desktop

## Deploy on GitHub Pages

1. Go to **Settings > Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, Folder: **/docs**
4. Click **Save**

Built by P Vishnuvardhan Reddy.
