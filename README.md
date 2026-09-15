# TeleCare — AI-Assisted Telemedicine Platform

A full-stack telemedicine web application with AI-powered symptom assessment, video consultations, and digital healthcare management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| AI Service | Python FastAPI |

## Quick Start

### 1. Backend
```bash
cd server
npm install
npm run seed    # Seed database with sample data
npm start       # Starts on port 3001
```

### 2. AI Service
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev     # Starts on port 5173
```

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@telecare.com | admin123 |
| Patient | patient@demo.com | demo1234 |
| Doctor | dr.sharma@telecare.com | doctor123 |

## Project Structure

```
telecare/
├── client/          # React frontend
├── server/          # Express backend API
├── ai-service/      # Python AI microservice
└── README.md
```

## Features (Phase 1)

- ✅ Landing page with healthcare design
- ✅ Patient & Doctor registration
- ✅ JWT authentication with role-based access
- ✅ Patient dashboard
- ✅ AI Symptom Checker with urgency triage
- ✅ Doctor discovery with filters
- ✅ Doctor dashboard
- ✅ Admin dashboard

## License

Academic project — not for medical use.
