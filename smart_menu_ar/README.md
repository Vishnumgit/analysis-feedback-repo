# Smart Menu 3D AR System

A complete QR-to-3D AR smart menu system for restaurants. Customers scan QR codes to view food items as interactive 3D models on their phones.

## Architecture

```
+------------------------+     +---------------------------+     +------------------------+
|  QR Generator App      | --> |  Backend API (CodeWords)  | <-- |  3D AR Viewer App       |
|  (Restaurant Staff)    |     |  smart_menu_ar_api        |     |  (Customer-facing)      |
|  - Browse menu items   |     |  - Menu data (Redis)      |     |  - 3D model viewer      |
|  - Generate QR codes   |     |  - QR code generation     |     |  - Item details          |
|  - Filter by category  |     |  - Analytics tracking     |     |  - Nutrition info        |
+------------------------+     +---------------------------+     +------------------------+
```

## Components

### 1. Backend API
- **Service ID**: `smart_menu_ar_api_9429c6e1`
- **Tech**: Python, FastAPI, Redis, QR Code generation
- **Endpoints**: `/api/menu`, `/api/menu/slug/{slug}`, `/api/analytics`

### 2. QR Generator Web App
- **Tech**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- Browse all menu items with category filters
- Generate QR codes that link to the 3D viewer

### 3. 3D AR Viewer Web App
- **Tech**: Next.js 16, TypeScript, Google model-viewer
- Interactive 3D model display with rotation and zoom
- AR mode for viewing items in real space
- Nutrition information display

## Menu Items

| Item | Price | Category |
|------|-------|----------|
| Classic Burger | $8.99 | Mains |
| Margherita Pizza | $12.99 | Mains |
| Caesar Salad | $7.49 | Starters |
| Chocolate Lava Cake | $6.99 | Desserts |
| Grilled Chicken Wings | $9.49 | Starters |
| Iced Matcha Latte | $4.99 | Drinks |

## How It Works

1. Restaurant staff opens the QR Generator app
2. They browse menu items and click "Generate QR Code" for any item
3. The QR code is printed/displayed on the table
4. Customer scans the QR with their phone camera
5. The 3D AR Viewer opens showing the food item as an interactive 3D model
6. Customer can rotate, zoom, and view the item in AR

Built with CodeWords by Agemo.
