# DataDoctor AI

AI-powered data cleaning and quality analysis platform that automatically detects data quality issues, generates insights, and provides cleaning recommendations using a modern React and FastAPI architecture with MongoDB Atlas.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Recharts
- **Backend**: Python 3.11+, FastAPI, MongoDB (Motor), Pandas
- **Database**: MongoDB Atlas
- **DevOps**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Account or Local MongoDB

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Database Setup
Ensure you have a MongoDB cluster URL ready and configured in the backend `.env` file.

### Docker Setup
```bash
docker-compose up -d
```

## Project Structure

```
datadoctor-ai/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   └── context/        # React context providers
│   └── package.json
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API route handlers
│   │   └── services/       # Business logic
│   └── requirements.txt
├── REQUIREMENTS.md         # Project requirements
├── SCOPE.md               # MVP vs future features
├── ARCHITECTURE.md        # Tech stack & architecture
└── DATABASE_SCHEMA.md     # Database schema
```

## Features

### MVP (Phase 1)
- User authentication (register/login)
- Dataset upload (CSV, Excel, JSON)
- Data audit (missing values, duplicates, outliers)
- Data cleaning (fill missing, remove duplicates, type casting)
- Basic visualization (bar, histogram, scatter)
- Dashboard with dataset management

### Phase 2 (Enhanced)
- Advanced EDA reports
- Dataset versioning
- OAuth login
- Docker deployment

### Phase 3 (AI & ML)
- AI-powered cleaning suggestions
- Natural language queries
- ML model training
- Anomaly detection

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/datadoctor?retryWrites=true&w=majority
MONGODB_DB_NAME=datadoctor
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=500
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## License

MIT License - for college project use
