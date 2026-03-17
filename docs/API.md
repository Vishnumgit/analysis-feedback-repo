# API Documentation

Base URL: `http://localhost:3000` (development) | `https://analysis-feedback-repo.onrender.com` (production)

All responses are JSON. Successful responses use HTTP 2xx. Errors include an `error` field.

---

## Health

### `GET /api/health`

Returns server status.

**Response 200**
```json
{ "status": "ok", "timestamp": "2026-03-17T12:00:00.000Z" }
```

---

## QR Codes

### `GET /api/qr/:qrCode`

Look up the product linked to a QR code. Used by the WebAR viewer on page load.

| Parameter | Type   | Description             |
|-----------|--------|-------------------------|
| `qrCode`  | string | The scanned QR code text |

**Response 200**
```json
{
  "data": {
    "product_id": 1,
    "product_name": "Modern Lounge Chair",
    "description": "A stylish lounge chair…",
    "model_url": "https://…/chair.glb",
    "texture_url": "https://…/chair_texture.png",
    "width": 0.75,
    "height": 0.90,
    "depth": 0.80,
    "category": "furniture",
    "price": "299.99",
    "qr_id": 1,
    "scan_count": 42
  }
}
```

**Response 404**
```json
{ "error": "QR code not found" }
```

---

### `POST /api/qr/:qrCode/scan`

Record a scan analytics event. Fire-and-forget – the WebAR viewer calls this automatically.

**Request body** (optional)
```json
{
  "user_agent": "Mozilla/5.0…",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response 200**
```json
{ "success": true, "message": "Scan recorded" }
```

---

## Products

### `GET /api/products`

List products with optional filtering and pagination.

**Query parameters**

| Parameter  | Type    | Default | Description                |
|------------|---------|---------|----------------------------|
| `page`     | integer | 1       | Page number (min 1)        |
| `limit`    | integer | 20      | Results per page (max 100) |
| `category` | string  | –       | Filter by category         |

**Response 200**
```json
{
  "data": [
    {
      "product_id": 1,
      "product_name": "Modern Lounge Chair",
      "model_url": "https://…/chair.glb",
      "category": "furniture",
      "price": "299.99",
      "created_at": "2026-03-17T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### `GET /api/products/:productId`

Get a single product by its numeric ID.

**Response 200**
```json
{
  "data": {
    "product_id": 1,
    "product_name": "Modern Lounge Chair",
    "description": "…",
    "model_url": "https://…/chair.glb",
    "texture_url": "https://…/chair_texture.png",
    "thumbnail_url": "https://…/chair_thumb.jpg",
    "width": 0.75,
    "height": 0.90,
    "depth": 0.80,
    "category": "furniture",
    "price": "299.99",
    "is_active": true,
    "created_at": "2026-03-17T10:00:00.000Z",
    "updated_at": "2026-03-17T10:00:00.000Z"
  }
}
```

**Response 404**
```json
{ "error": "Product not found" }
```

---

### `POST /api/products`

Create a new product entry (admin use).

**Request body**
```json
{
  "product_name": "New Chair",
  "description": "Optional description",
  "model_url": "https://…/newchair.glb",
  "texture_url": "https://…/newchair_tex.png",
  "category": "furniture",
  "price": 199.99,
  "width": 0.7,
  "height": 0.9,
  "depth": 0.7
}
```

**Response 201** – returns the created product object.

---

## Error Codes

| Code | Meaning                        |
|------|--------------------------------|
| 400  | Bad request / validation error |
| 404  | Resource not found             |
| 422  | Unprocessable entity (invalid input fields) |
| 429  | Too many requests (rate limited) |
| 500  | Internal server error          |
