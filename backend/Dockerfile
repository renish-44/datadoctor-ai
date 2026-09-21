# ──────────────────────────────────────────────────────────────
# Backend Dockerfile — FastAPI + Uvicorn
# ──────────────────────────────────────────────────────────────
FROM python:3.14-slim AS backend

WORKDIR /app

# Install system deps needed by some Python packages (bcrypt, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libffi-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create logs and uploads directories
RUN mkdir -p logs uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
