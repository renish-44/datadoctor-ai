# DataDoctor AI - Tech Stack & Architecture

## 1. Tech Stack Decision

### 1.1 Frontend: React + Vite + Tailwind CSS

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI component library |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Recharts | 2.x | Chart library |
| React Dropzone | 14.x | File upload component |

**Why React + Vite?**
- Vite offers instant HMR (Hot Module Replacement) vs Webpack's slower rebuilds
- React ecosystem is mature with extensive component libraries
- Tailwind CSS accelerates UI development with utility classes
- React's component model fits the dashboard UI pattern perfectly

### 1.2 Backend: Python + FastAPI

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.109+ | Async web framework |
| Pydantic | 2.x | Data validation & settings |
| SQLAlchemy | 2.x | ORM & database toolkit |
| Pandas | 2.x | Data manipulation |
| NumPy | 1.x | Numerical computing |
| python-jose | 3.x | JWT token handling |
| Passlib | 1.x | Password hashing |
| Alembic | 1.x | Database migrations |
| Uvicorn | 0.x | ASGI server |

**Why FastAPI over Node/Express?**

| Aspect | FastAPI (Python) | Node/Express (JavaScript) |
|--------|-----------------|---------------------------|
| **Data Processing** | Pandas is unmatched for tabular data | Requires libraries like Danfo.js (less mature) |
| **Async Support** | Native async/await, automatic OpenAPI | Manual async, requires middleware |
| **Type Safety** | Pydantic models auto-validate request/response | Requires manual validation or Joi/Zod |
| **API Docs** | Auto-generated Swagger/ReDoc | Requires Swagger-jsdoc setup |
| **ML Integration** | Direct access to scikit-learn, TensorFlow | Requires separate Python service |
| **Performance** | High (comparable to Node for I/O) | High (event loop model) |
| **Learning Curve** | Steeper for JS developers | Lower for JS-heavy teams |
| **Ecosystem** | Strong for data/ML/ scientific computing | Strong for web/mobile/real-time |

**Decision:** FastAPI is the clear choice because:
1. DataDoctor's core value is data processing (Pandas)
2. ML/AI features in Phase 3 require Python ecosystem
3. Auto-generated API documentation saves development time
4. Pydantic validation eliminates boilerplate validation code

### 1.3 Database: PostgreSQL

| Technology | Version | Purpose |
|-----------|---------|---------|
| PostgreSQL | 15+ | Primary relational database |
| SQLAlchemy | 2.x | ORM & connection pooling |
| Alembic | 1.x | Schema migrations |

**Why PostgreSQL?**
- ACID compliance for data integrity
- JSON/JSONB support for flexible audit report storage
- Full-text search for dataset discovery
- Array types for column metadata
- Robust indexing for large dataset queries
- Mature replication for future scalability

### 1.4 DevOps & Tooling

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| Git | Version control |
| ESLint | JavaScript linting |
| Ruff | Python linting |
| Pytest | Python testing |
| Vitest | JavaScript testing |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                          │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ React App   │  │  Recharts    │  │  React Dropzone        │ │
│  │ (Vite)      │  │  (Charts)    │  │  (File Upload)         │ │
│  └──────┬──────┘  └──────────────┘  └────────────────────────┘ │
│         │                                                        │
│         │  Axios HTTP Client                                    │
│         │  (JWT Bearer Token)                                    │
└─────────┼───────────────────────────────────────────────────────┘
          │
          │ HTTPS (REST API)
          │
┌─────────▼───────────────────────────────────────────────────────┐
│                     API GATEWAY (Nginx)                         │
│                   - Rate Limiting                                │
│                   - CORS Headers                                 │
│                   - Static File Serving                          │
│                   - SSL Termination                              │
└─────────┬───────────────────────────────────────────────────────┘
          │
          │
┌─────────▼───────────────────────────────────────────────────────┐
│                    FASTAPI APPLICATION                           │
│                    (Uvicorn ASGI)                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ROUTERS LAYER                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Auth    │ │ Dataset  │ │  Audit   │ │ Cleaning │   │   │
│  │  │ Router   │ │  Router  │ │  Router  │ │  Router  │   │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │   │
│  └───────┼─────────────┼───────────┼─────────────┼─────────┘   │
│          │             │           │             │               │
│  ┌───────▼─────────────▼───────────▼─────────────▼─────────┐   │
│  │                   SERVICES LAYER                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Auth    │ │ Dataset  │ │  Audit   │ │ Cleaning │   │   │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │   │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │   │
│  │       │             │           │             │           │   │
│  │  ┌────▼─────────────▼───────────▼─────────────▼────────┐ │   │
│  │  │              DATA ACCESS LAYER (SQLAlchemy)         │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EXTERNAL SERVICES                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │   │
│  │  │  Pandas  │ │  NumPy   │ │  Future  │                │   │
│  │  │ (Data)   │ │ (Math)   │ │ (ML/AI)  │                │   │
│  │  └──────────┘ └──────────┘ └──────────┘                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────────┘
          │
          │ SQLAlchemy (Async)
          │
┌─────────▼───────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                         │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  users   │ │ datasets │ │  audit   │ │ cleaning │          │
│  │          │ │          │ │ _reports │ │  _jobs   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FILE STORAGE (Local/S3)                     │   │
│  │  /uploads/{user_id}/{dataset_id}/raw/                    │   │
│  │  /uploads/{user_id}/{dataset_id}/cleaned/                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Frontend Components

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── DashboardLayout.tsx
│   ├── dataset/
│   │   ├── UploadZone.tsx
│   │   ├── DatasetList.tsx
│   │   ├── DatasetCard.tsx
│   │   └── DataPreview.tsx
│   ├── audit/
│   │   ├── AuditReport.tsx
│   │   ├── MissingValuesChart.tsx
│   │   ├── DuplicateDetector.tsx
│   │   └── StatisticsTable.tsx
│   ├── cleaning/
│   │   ├── CleaningPanel.tsx
│   │   ├── OperationList.tsx
│   │   └── CleaningHistory.tsx
│   └── charts/
│       ├── BarChart.tsx
│       ├── Histogram.tsx
│       ├── ScatterPlot.tsx
│       └── Heatmap.tsx
```

### 3.2 Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Settings & environment
│   ├── database.py                # SQLAlchemy engine & session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User SQLAlchemy model
│   │   ├── dataset.py             # Dataset SQLAlchemy model
│   │   ├── audit_report.py        # AuditReport model
│   │   └── cleaning_job.py        # CleaningJob model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # User Pydantic schemas
│   │   ├── dataset.py             # Dataset Pydantic schemas
│   │   ├── audit.py               # Audit Pydantic schemas
│   │   └── cleaning.py            # Cleaning Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                # /api/v1/auth/*
│   │   ├── datasets.py            # /api/v1/datasets/*
│   │   ├── audit.py               # /api/v1/audit/*
│   │   └── cleaning.py            # /api/v1/cleaning/*
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py        # Authentication logic
│   │   ├── dataset_service.py     # Dataset CRUD & parsing
│   │   ├── audit_service.py       # Audit analysis engine
│   │   ├── cleaning_service.py    # Cleaning operations
│   │   └── visualization_service.py # Chart data generation
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py                # JWT middleware
│   │   └── rate_limit.py          # Rate limiting
│   └── utils/
│       ├── __init__.py
│       ├── file_handler.py        # File upload/download
│       └── validators.py          # Input validation
├── alembic/                       # Database migrations
├── tests/                         # Test suite
├── requirements.txt
├── Dockerfile
└── alembic.ini
```

---

## 4. API Design Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login & get JWT |
| GET | `/api/v1/auth/me` | Get current user |

### Datasets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/datasets/upload` | Upload new dataset |
| GET | `/api/v1/datasets` | List user's datasets |
| GET | `/api/v1/datasets/{id}` | Get dataset details |
| GET | `/api/v1/datasets/{id}/preview` | Preview data (first 100 rows) |
| DELETE | `/api/v1/datasets/{id}` | Delete dataset |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/audit/{dataset_id}/run` | Run audit on dataset |
| GET | `/api/v1/audit/{dataset_id}/reports` | List audit reports |
| GET | `/api/v1/audit/reports/{report_id}` | Get specific report |

### Cleaning
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/cleaning/{dataset_id}/apply` | Apply cleaning operations |
| GET | `/api/v1/cleaning/{dataset_id}/history` | Cleaning job history |
| POST | `/api/v1/cleaning/jobs/{job_id}/undo` | Undo cleaning job |

---

## 5. Data Flow

### 5.1 Upload Flow
```
User → Dropzone → POST /upload → FastAPI → Parse (Pandas) → 
Store CSV → Create DB Record → Return Preview
```

### 5.2 Audit Flow
```
User → Click Audit → POST /audit/{id}/run → FastAPI → 
Load Dataset → Analyze (Pandas) → Generate Report → 
Store Report → Return JSON
```

### 5.3 Cleaning Flow
```
User → Select Operations → POST /cleaning/{id}/apply → 
FastAPI → Load Dataset → Apply Transformations → 
Save Cleaned Version → Record Job → Return Result
```

---

## 6. Deployment Architecture (Docker Compose)

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
  
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/datadoctor
  
  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: datadoctor
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass

volumes:
  pgdata:
```

---

## 7. Environment Configuration

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/datadoctor
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=500
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=DataDoctor AI
```
