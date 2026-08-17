from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class AuditReportResponse(BaseModel):
    id: str
    dataset_id: str
    report_data: Dict[str, Any]
    summary: Optional[str]
    row_count: int
    column_count: int
    issues_found: int
    severity: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuditReportList(BaseModel):
    id: str
    issues_found: int
    severity: str
    created_at: datetime

    class Config:
        from_attributes = True
