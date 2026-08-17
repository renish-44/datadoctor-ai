# DataDoctor AI - Requirements Document

## 1. Project Overview

**DataDoctor AI** is a web-based data-quality and CRM platform that enables users to upload, audit, clean, explore, and visualize datasets through an intuitive interface, with future plans for AI-assisted data analysis.

---

## 2. Core Modules

### 2.1 Dataset Upload
- Support for CSV, Excel (XLSX/XLS), JSON, and Parquet file formats
- Drag-and-drop and file-browser upload interfaces
- File size limit: 500MB (configurable)
- Preview of first 100 rows after upload
- Automatic schema detection (column names, data types)

### 2.2 Data Audit
- Missing value analysis per column
- Duplicate row detection
- Outlier detection (IQR and Z-score methods)
- Data type inconsistency checks
- Summary statistics (mean, median, std, min, max, percentiles)
- Column cardinality and unique value counts
- Distribution analysis for numerical and categorical columns
- Generated audit report with severity ratings (critical, warning, info)

### 2.3 Data Cleaning
- Missing value imputation (mean, median, mode, constant, forward-fill, drop)
- Duplicate removal (exact and fuzzy matching)
- Outlier handling (cap, remove, replace with median)
- Column type casting and format standardization
- String cleaning (trim, case normalization, regex replace)
- Date parsing and normalization
- Rename and drop columns
- Undo/cleanup job history with rollback capability

### 2.4 Exploratory Data Analysis (EDA)
- Automated EDA report generation
- Correlation matrix computation
- Feature distribution plots
- Group-by aggregations
- Cross-tabulation
- Time-series decomposition (if applicable)

### 2.5 Visualization
- Bar charts, histograms, scatter plots, line charts, heatmaps
- Box plots for distribution analysis
- Missing value heatmap
- Interactive plot configuration (axes, filters, colors)
- Export plots as PNG/SVG
- Dashboard for combining multiple visualizations

### 2.6 User Authentication & Management
- Registration, login, logout
- JWT-based authentication
- Password reset flow
- User profile management
- Session management

### 2.7 Dataset Management
- Dataset listing with metadata
- Dataset versioning (snapshot before cleaning)
- Search and filter datasets
- Share datasets between users (future)
- Delete with confirmation

---

## 3. Functional Requirements

### FR-01: User Authentication
- **FR-01.1**: Users can register with email/password
- **FR-01.2**: Users can log in and receive a JWT token
- **FR-01.3**: Protected endpoints reject unauthenticated requests with 401
- **FR-01.4**: Users can reset their password via email

### FR-02: Dataset Upload
- **FR-02.1**: Users can upload files via drag-drop or file picker
- **FR-02.2**: System validates file type and size before processing
- **FR-02.3**: System parses file and stores data in PostgreSQL
- **FR-02.4**: System returns schema preview and row count after upload
- **FR-02.5**: Upload progress is displayed in real-time

### FR-03: Data Audit
- **FR-03.1**: Users can trigger an audit on any uploaded dataset
- **FR-03.2**: System analyzes missing values, duplicates, outliers, and types
- **FR-03.3**: System generates a structured audit report (JSON)
- **FR-03.4**: Audit report is displayed in dashboard with charts
- **FR-03.5**: Historical audit reports are stored and comparable

### FR-04: Data Cleaning
- **FR-04.1**: Users select cleaning operations from a rule panel
- **FR-04.2**: System applies operations and produces a cleaned dataset
- **FR-04.3**: Cleaning jobs are recorded with full operation log
- **FR-04.4**: Users can preview changes before committing
- **FR-04.5**: Users can undo a cleaning job (restore previous version)

### FR-05: EDA & Visualization
- **FR-05.1**: Users can generate automated EDA reports
- **FR-05.2**: Users can create custom charts via a builder UI
- **FR-05.3**: Charts are interactive (zoom, pan, hover tooltips)
- **FR-05.4**: Users can export charts as image files

### FR-06: Dataset Management
- **FR-06.1**: Users can view all their datasets in a list/grid view
- **FR-06.2**: Users can view dataset metadata and schema
- **FR-06.3**: Users can delete datasets with confirmation
- **FR-06.4**: System maintains dataset version history

---

## 4. Non-Functional Requirements

### NFR-01: Performance
- File upload handles up to 500MB without timeout
- Audit report generation completes within 30 seconds for datasets up to 1M rows
- Cleaning operations complete within 60 seconds for datasets up to 1M rows
- Dashboard initial load under 2 seconds on broadband connection
- API response time under 200ms for CRUD operations

### NFR-02: Scalability
- System supports up to 10,000 registered users
- Concurrent processing of up to 50 cleaning/audit jobs
- Horizontal scaling of backend via container orchestration

### NFR-03: Security
- All API endpoints behind HTTPS
- JWT tokens with 24-hour expiration and refresh mechanism
- Passwords hashed with bcrypt (minimum 12 rounds)
- Input validation and sanitization on all endpoints
- SQL injection prevention via ORM parameterized queries
- CORS restricted to known frontend origins
- Rate limiting: 100 requests/minute per user

### NFR-04: Reliability
- 99.5% uptime target
- Graceful error handling with meaningful error messages
- Failed jobs logged with stack traces
- Database connection pooling (min 5, max 20 connections)

### NFR-05: Usability
- Responsive design for desktop (1024px+) and tablet (768px+)
- Accessible color scheme (WCAG 2.1 AA)
- Loading indicators for all async operations
- Toast notifications for success/error feedback
- Keyboard navigation support

### NFR-06: Maintainability
- Modular architecture with clear separation of concerns
- API versioning (v1 prefix)
- Comprehensive API documentation via OpenAPI/Swagger
- Code coverage target: 80% for backend services
- Environment-based configuration (.env files)

### NFR-07: Data Integrity
- All cleaning operations are logged immutably
- Dataset snapshots preserved before cleaning
- Transaction support for multi-step operations
- Backup capability for user data

---

## 5. Technology Constraints

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python 3.11+, FastAPI |
| Database | PostgreSQL 15+ |
| Data Processing | Pandas, NumPy |
| Visualization | Chart.js / Recharts / Plotly.js |
| Authentication | JWT (jose) |
| File Storage | Local filesystem (MVP), S3 (future) |
| Containerization | Docker, Docker Compose |
