from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from app.config import settings
from app.database import init_db, close_db, check_db_connection
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.routers import auth, datasets, audit, cleaning


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="DataDoctor AI",
    description="Data Quality & Cleaning Platform API",
    version="0.1.0",
    lifespan=lifespan,
)

# Global exception handler for MongoDB errors:
# Catches connection failures, DNS errors, and timeouts, returning clean JSON HTTP 503
# with CORS headers preserved so browsers do not misinterpret server crashes as CORS blocks.
@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": (
                "Database connection error: Unable to communicate with MongoDB. "
                "Please verify your MONGODB_URL in backend/.env, check that the Atlas cluster is active, "
                f"and ensure IP access is allowed. Details: {str(exc)}"
            )
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured request logging — captures IP, method, path, latency, status, action, user_id
app.add_middleware(RequestLoggingMiddleware)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(cleaning.router, prefix="/api/v1/cleaning", tags=["Cleaning"])


@app.get("/")
async def root():
    return {"message": "DataDoctor AI API", "version": "0.1.0"}


@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    db_info = await check_db_connection()
    is_db_connected = db_info["status"] == "connected"
    return {
        "status": "healthy" if is_db_connected else "degraded",
        "backend": "healthy",
        "database": db_info,
        "version": settings.VERSION,
    }


@app.get("/health/db")
@app.get("/api/v1/health/db")
async def db_health_check():
    return await check_db_connection()


