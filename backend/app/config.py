from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "DataDoctor AI"
    VERSION: str = "0.1.0"

    MONGODB_URL: str = "mongodb+srv://<username>:<password>@cluster0.0zlvqr9.mongodb.net/datadoctor?retryWrites=true&w=majority"
    MONGODB_DB_NAME: str = "datadoctor"


    SECRET_KEY: str = "datadoctor-super-secret-key-change-this-32chars!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 500

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = str(ENV_FILE_PATH)
        case_sensitive = True


settings = Settings()

