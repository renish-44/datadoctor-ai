from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
import uuid


def generate_id() -> str:
    return str(uuid.uuid4())


class UserModel(BaseModel):
    id: str = Field(default_factory=generate_id)
    email: str
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DatasetModel(BaseModel):
    id: str = Field(default_factory=generate_id)
    user_id: str
    name: str
    description: Optional[str] = None
    file_path: str
    original_filename: str
    file_size_bytes: int
    row_count: int = 0
    column_count: int = 0
    column_names: list = []
    column_types: dict = {}
    status: str = "uploading"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AuditReportModel(BaseModel):
    id: str = Field(default_factory=generate_id)
    dataset_id: str
    report_data: dict = {}
    summary: Optional[str] = None
    row_count: int
    column_count: int
    issues_found: int = 0
    severity: str = "info"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CleaningJobModel(BaseModel):
    id: str = Field(default_factory=generate_id)
    dataset_id: str
    operations: list = []
    status: str = "pending"
    result_file: Optional[str] = None
    rows_before: Optional[int] = None
    rows_after: Optional[int] = None
    columns_before: Optional[int] = None
    columns_after: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
