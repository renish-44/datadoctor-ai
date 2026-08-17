from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None


class DatasetCreate(DatasetBase):
    pass


class DatasetResponse(DatasetBase):
    id: str
    user_id: str
    file_path: str
    original_filename: str
    file_size_bytes: int
    row_count: int
    column_count: int
    column_names: List[str]
    column_types: Dict[str, str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    id: str
    name: str
    original_filename: str
    row_count: int
    column_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DatasetPreview(BaseModel):
    columns: List[str]
    data: List[Dict[str, Any]]
    total_rows: int
