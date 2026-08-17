# DataDoctor AI - Database Schema

## 1. Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────────┐
│        users         │       │        datasets           │
├──────────────────────┤       ├──────────────────────────┤
│ id (PK, UUID)        │──┐    │ id (PK, UUID)            │
│ email (VARCHAR 255)  │  │    │ user_id (FK → users.id)  │
│ hashed_password      │  │    │ name (VARCHAR 255)       │
│ full_name (VARCHAR)  │  │    │ description (TEXT)        │
│ is_active (BOOLEAN)  │  └───▶│ file_path (VARCHAR 500)   │
│ created_at (TIMESTMP)│       │ original_filename (VARCH) │
│ updated_at (TIMESTMP)│       │ file_size_bytes (BIGINT)  │
│                      │       │ row_count (INTEGER)       │
│                      │       │ column_count (INTEGER)    │
│                      │       │ column_names (JSONB)      │
│                      │       │ column_types (JSONB)      │
│                      │       │ status (VARCHAR 20)       │
│                      │       │ created_at (TIMESTMP)     │
│                      │       │ updated_at (TIMESTMP)     │
└──────────────────────┘       └─────────┬────────────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          │              │              │
                          ▼              ▼              ▼
                ┌────────────────┐ ┌─────────────┐ ┌─────────────────┐
                │  audit_reports │ │ cleaning_   │ │ dataset_        │
                ├────────────────┤ │ jobs        │ │ versions        │
                │ id (PK, UUID)  │ ├─────────────┤ ├─────────────────┤
                │ dataset_id(FK) │ │ id (PK,UUID)│ │ id (PK, UUID)   │
                │ report_data    │ │ dataset_id  │ │ dataset_id (FK) │
                │ summary        │ │ (FK)        │ │ version_number  │
                │ row_count      │ │ operations  │ │ file_path       │
                │ column_count   │ │ (JSONB)     │ │ row_count       │
                │ issues_found   │ │ status      │ │ created_at      │
                │ severity       │ │ result_file │ │                 │
                │ created_at     │ │ created_at  │ │                 │
                └────────────────┘ │ completed_at│ │                 │
                                   └─────────────┘ └─────────────────┘
```

---

## 2. Table Definitions (PostgreSQL)

### 2.1 users

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 datasets

```sql
CREATE TYPE dataset_status AS ENUM ('uploading', 'ready', 'processing', 'error');

CREATE TABLE datasets (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    file_path         VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes   BIGINT NOT NULL,
    row_count         INTEGER NOT NULL DEFAULT 0,
    column_count      INTEGER NOT NULL DEFAULT 0,
    column_names      JSONB NOT NULL DEFAULT '[]'::JSONB,
    column_types      JSONB NOT NULL DEFAULT '{}'::JSONB,
    status            dataset_status NOT NULL DEFAULT 'uploading',
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_datasets_user_id ON datasets(user_id);
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_created_at ON datasets(created_at DESC);
CREATE INDEX idx_datasets_user_created ON datasets(user_id, created_at DESC);

CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE datasets IS 'Stores metadata about uploaded datasets';
COMMENT ON COLUMN datasets.column_names IS 'JSON array of column names: ["col1", "col2", ...]';
COMMENT ON COLUMN datasets.column_types IS 'JSON object mapping column names to types: {"col1": "int64", "col2": "object"}';
```

### 2.3 audit_reports

```sql
CREATE TYPE audit_severity AS ENUM ('info', 'warning', 'critical');

CREATE TABLE audit_reports (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id    UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    report_data   JSONB NOT NULL DEFAULT '{}'::JSONB,
    summary       TEXT,
    row_count     INTEGER NOT NULL,
    column_count  INTEGER NOT NULL,
    issues_found  INTEGER NOT NULL DEFAULT 0,
    severity      audit_severity NOT NULL DEFAULT 'info',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_reports_dataset_id ON audit_reports(dataset_id);
CREATE INDEX idx_audit_reports_created_at ON audit_reports(created_at DESC);
CREATE INDEX idx_audit_reports_dataset_created ON audit_reports(dataset_id, created_at DESC);

COMMENT ON TABLE audit_reports IS 'Stores data audit analysis results';
COMMENT ON COLUMN audit_reports.report_data IS 'Full audit report JSON with missing values, duplicates, outliers, statistics';
```

**report_data JSONB Structure:**
```json
{
  "missing_values": {
    "total_missing": 150,
    "columns": {
      "age": {"count": 45, "percentage": 9.0},
      "email": {"count": 105, "percentage": 21.0}
    }
  },
  "duplicates": {
    "exact_duplicates": 23,
    "duplicate_percentage": 4.6,
    "duplicate_column_groups": [["name", "email"]]
  },
  "outliers": {
    "columns": {
      "income": {"method": "iqr", "count": 12, "indices": [3, 45, 67]}
    }
  },
  "data_types": {
    "inconsistencies": [
      {"column": "date_col", "issue": "mixed_formats", "examples": ["2024-01-15", "01/15/2024"]}
    ]
  },
  "statistics": {
    "numeric": {
      "age": {"mean": 34.5, "median": 32.0, "std": 12.3, "min": 18, "max": 89}
    },
    "categorical": {
      "gender": {"unique": 3, "top": "female", "top_count": 256}
    }
  }
}
```

### 2.4 cleaning_jobs

```sql
CREATE TYPE cleaning_status AS ENUM ('pending', 'running', 'completed', 'failed', 'undone');

CREATE TABLE cleaning_jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id      UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    operations      JSONB NOT NULL DEFAULT '[]'::JSONB,
    status          cleaning_status NOT NULL DEFAULT 'pending',
    result_file     VARCHAR(500),
    rows_before     INTEGER,
    rows_after      INTEGER,
    columns_before  INTEGER,
    columns_after   INTEGER,
    error_message   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_cleaning_jobs_dataset_id ON cleaning_jobs(dataset_id);
CREATE INDEX idx_cleaning_jobs_status ON cleaning_jobs(status);
CREATE INDEX idx_cleaning_jobs_created_at ON cleaning_jobs(created_at DESC);
CREATE INDEX idx_cleaning_jobs_dataset_created ON cleaning_jobs(dataset_id, created_at DESC);

COMMENT ON TABLE cleaning_jobs IS 'Tracks data cleaning operations applied to datasets';
COMMENT ON COLUMN cleaning_jobs.operations IS 'JSON array of cleaning operations applied';
```

**operations JSONB Structure:**
```json
[
  {
    "operation": "drop_duplicates",
    "params": {"subset": null, "keep": "first"},
    "affected_rows": 23
  },
  {
    "operation": "fill_missing",
    "params": {"column": "age", "method": "median", "value": null},
    "affected_rows": 45
  },
  {
    "operation": "drop_columns",
    "params": {"columns": ["unnamed_col", "temp_field"]},
    "affected_rows": 0
  },
  {
    "operation": "cast_type",
    "params": {"column": "price", "target_type": "float64"},
    "affected_rows": 500
  },
  {
    "operation": "string_clean",
    "params": {"column": "name", "operations": ["trim", "lower"]},
    "affected_rows": 312
  }
]
```

### 2.5 dataset_versions (MVP Extension)

```sql
CREATE TABLE dataset_versions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id    UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    row_count     INTEGER NOT NULL,
    cleaning_job_id UUID REFERENCES cleaning_jobs(id) ON DELETE SET NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(dataset_id, version_number)
);

CREATE INDEX idx_dataset_versions_dataset_id ON dataset_versions(dataset_id);
CREATE INDEX idx_dataset_versions_version ON dataset_versions(dataset_id, version_number DESC);

COMMENT ON TABLE dataset_versions IS 'Version history of dataset snapshots before/after cleaning';
```

---

## 3. Relationships Summary

| Relationship | Type | FK Column | On Delete |
|-------------|------|-----------|-----------|
| users → datasets | One-to-Many | datasets.user_id | CASCADE |
| datasets → audit_reports | One-to-Many | audit_reports.dataset_id | CASCADE |
| datasets → cleaning_jobs | One-to-Many | cleaning_jobs.dataset_id | CASCADE |
| datasets → dataset_versions | One-to-Many | dataset_versions.dataset_id | CASCADE |
| cleaning_jobs → dataset_versions | One-to-Many | dataset_versions.cleaning_job_id | SET NULL |

---

## 4. Sample Queries

### 4.1 Get all datasets for a user
```sql
SELECT d.*, 
       (SELECT COUNT(*) FROM audit_reports ar WHERE ar.dataset_id = d.id) as audit_count,
       (SELECT COUNT(*) FROM cleaning_jobs cj WHERE cj.dataset_id = d.id) as cleaning_count
FROM datasets d
WHERE d.user_id = :user_id
ORDER BY d.created_at DESC;
```

### 4.2 Get latest audit report for a dataset
```sql
SELECT *
FROM audit_reports
WHERE dataset_id = :dataset_id
ORDER BY created_at DESC
LIMIT 1;
```

### 4.3 Get cleaning history for a dataset
```sql
SELECT 
    cj.id,
    cj.status,
    cj.operations,
    cj.rows_before,
    cj.rows_after,
    cj.created_at,
    cj.completed_at
FROM cleaning_jobs cj
WHERE cj.dataset_id = :dataset_id
ORDER BY cj.created_at DESC;
```

### 4.4 Get dataset statistics overview
```sql
SELECT 
    d.id,
    d.name,
    d.row_count,
    d.column_count,
    d.status,
    (SELECT COUNT(*) FROM audit_reports ar WHERE ar.dataset_id = d.id) as total_audits,
    (SELECT COUNT(*) FROM cleaning_jobs cj WHERE cj.dataset_id = d.id AND cj.status = 'completed') as completed_cleanings,
    d.created_at,
    d.updated_at
FROM datasets d
WHERE d.user_id = :user_id
ORDER BY d.updated_at DESC;
```

---

## 5. Indexes Performance Notes

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `idx_users_email` | Fast login lookup | `WHERE email = ?` |
| `idx_datasets_user_id` | User's dataset listing | `WHERE user_id = ?` |
| `idx_datasets_user_created` | Sorted dataset list | `WHERE user_id = ? ORDER BY created_at DESC` |
| `idx_audit_reports_dataset_id` | Dataset's audit history | `WHERE dataset_id = ?` |
| `idx_cleaning_jobs_dataset_id` | Dataset's cleaning history | `WHERE dataset_id = ?` |
| `idx_cleaning_jobs_status` | Background job polling | `WHERE status IN ('pending', 'running')` |

---

## 6. Migration Strategy

Use Alembic for schema migrations:

```bash
# Initialize migrations
alembic init alembic

# Generate migration after model changes
alembic revision --autogenerate -m "initial schema"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Migration File Naming Convention
```
alembic/versions/
├── 001_create_users_table.py
├── 002_create_datasets_table.py
├── 003_create_audit_reports_table.py
├── 004_create_cleaning_jobs_table.py
└── 005_create_dataset_versions_table.py
```
