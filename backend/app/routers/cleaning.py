from fastapi import APIRouter, Depends, status
from typing import List

from app.schemas.cleaning import CleaningRequest, CleaningJobResponse, CleaningJobList
from app.services.auth_service import AuthService
from app.services.cleaning_service import CleaningService

router = APIRouter()
cleaning_service = CleaningService()


@router.post("/{dataset_id}/apply", response_model=CleaningJobResponse, status_code=status.HTTP_201_CREATED)
async def apply_cleaning(
    dataset_id: str,
    cleaning_request: CleaningRequest,
    current_user=Depends(AuthService.get_current_user)
):
    return await cleaning_service.apply_cleaning(dataset_id, current_user["id"], cleaning_request)


@router.get("/{dataset_id}/history", response_model=List[CleaningJobList])
async def list_cleaning_history(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await cleaning_service.list_history(dataset_id, current_user["id"])


@router.post("/jobs/{job_id}/undo", response_model=CleaningJobResponse)
async def undo_cleaning_job(
    job_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await cleaning_service.undo_job(job_id, current_user["id"])
