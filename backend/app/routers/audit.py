from fastapi import APIRouter, Depends, status
from typing import List

from app.schemas.audit import AuditReportResponse, AuditReportList
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService

router = APIRouter()
audit_service = AuditService()


@router.post("/{dataset_id}/run", response_model=AuditReportResponse, status_code=status.HTTP_201_CREATED)
async def run_audit(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await audit_service.run_audit(dataset_id, current_user["id"])


@router.get("/{dataset_id}/reports", response_model=List[AuditReportList])
async def list_audit_reports(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await audit_service.list_reports(dataset_id, current_user["id"])


@router.get("/reports/{report_id}", response_model=AuditReportResponse)
async def get_audit_report(
    report_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await audit_service.get_report(report_id, current_user["id"])
