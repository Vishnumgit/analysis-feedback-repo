# Smart Menu 3D AR - Backend API

CodeWords backend service powering the Smart Menu 3D AR system.

**Service ID:** `smart_menu_ar_api_9429c6e1`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/menu` | List all menu items (optional `?category=mains`) |
| GET | `/api/menu/{id}` | Get item by ID |
| GET | `/api/menu/slug/{slug}` | Get item by slug |
| GET | `/api/analytics` | All item analytics |
| GET | `/api/analytics/{id}` | Single item analytics |
| POST | `/` | Main endpoint (list_menu, get_item, generate_qr, track_event, analytics) |

## Tech

- **Python 3.11** + **FastAPI**
- **Redis** for menu catalog & analytics storage
- **qrcode** + **Pillow** for QR code generation
- Deployed on **CodeWords** serverless platform

## Dependencies

```
codewords-client==0.4.5
fastapi==0.116.1
qrcode==8.0
Pillow==11.1.0
```
