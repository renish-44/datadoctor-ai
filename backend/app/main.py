from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, close_db
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(cleaning.router, prefix="/api/v1/cleaning", tags=["Cleaning"])


@app.get("/")
async def root():
    return {"message": "DataDoctor AI API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
