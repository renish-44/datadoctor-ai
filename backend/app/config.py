from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "DataDoctor AI"
    VERSION: str = "0.1.0"

    MONGODB_URL: str = "mongodb+srv://<username>:<password>@cluster.mongodb.net/datadoctor?retryWrites=true&w=majority"
    MONGODB_DB_NAME: str = "datadoctor"

    SECRET_KEY: str = "datadoctor-super-secret-key-change-this-32chars!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 500

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
