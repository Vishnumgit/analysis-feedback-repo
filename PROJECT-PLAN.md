# Project Documentation for QR to 3D AR Hybrid Visualization System

## System Architecture

The system architecture consists of the following components:
1. **QR Code Generator**: Generates unique QR codes for each 3D model.
2. **3D Model Repository**: Stores all 3D models accessible through the QR codes.
3. **Web Server**: Hosts the API that serves the 3D models.
4. **Mobile Application**: Scans the QR code and renders the corresponding 3D model in augmented reality.

## Data Flow Diagrams (DFDs)

- **Level 0**: High-level overview of components and data flow.
- **Level 1**: Detailed breakdown of each component's interactions.

## Entity-Relationship Diagrams (ER Diagrams)

![ER Diagram](path/to/your/er-diagram.png)  
- Entities: Users, QR Codes, 3D Models, Sessions.

## Development Roadmap

1. **Phase 1**: Requirement gathering and analysis (Q1 2026).
2. **Phase 2**: Design and prototyping (Q2 2026).
3. **Phase 3**: Development and testing (Q3 2026).
4. **Phase 4**: Deployment and feedback (Q4 2026).

## API Specifications

- **GET /api/models/{qr_code}**: Retrieve the 3D model associated with a specific QR code.
- **POST /api/models**: Upload a new 3D model.

## Database Schema

- **Users Table**: `user_id`, `username`, `email`, `password`.
- **Models Table**: `model_id`, `qr_code`, `model_data`, `user_id`.

## Deployment Guides

1. Setup the web server with Node.js.
2. Configure the database using PostgreSQL / Supabase.
3. Deploy the backend to Render.
4. Deploy the frontend to Vercel.

### Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://analysis-feedback-repo.onrender.com |
| Health endpoint | https://analysis-feedback-repo.onrender.com/api/health |
| Products endpoint | https://analysis-feedback-repo.onrender.com/api/products |

### Environment Variables

```env
API_BASE_URL=https://analysis-feedback-repo.onrender.com
VITE_API_URL=https://analysis-feedback-repo.onrender.com
```

## Technology Stack

- Backend: Node.js, Express.js
- Frontend: Flutter
- Database: MySQL
- Cloud: AWS/Azure for hosting.