from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class CleaningOperation(BaseModel):
    operation: str
    params: Dict[str, Any] = {}


class CleaningRequest(BaseModel):
    operations: List[CleaningOperation]


class CleaningJobResponse(BaseModel):
    id: str
    dataset_id: str
    operations: List[Dict[str, Any]]
    status: str
    result_file: Optional[str]
    rows_before: Optional[int]
    rows_after: Optional[int]
    columns_before: Optional[int]
    columns_after: Optional[int]
    error_message: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class CleaningJobList(BaseModel):
    id: str
    status: str
    operations: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
