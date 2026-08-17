from fastapi import APIRouter, Depends, UploadFile, File, status
from typing import List

from app.schemas.dataset import DatasetResponse, DatasetListResponse, DatasetPreview
from app.services.auth_service import AuthService
from app.services.dataset_service import DatasetService

router = APIRouter()
dataset_service = DatasetService()


@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = None,
    current_user=Depends(AuthService.get_current_user)
):
    return await dataset_service.upload_dataset(file, current_user["id"], name)


@router.get("/", response_model=List[DatasetListResponse])
async def list_datasets(current_user=Depends(AuthService.get_current_user)):
    return await dataset_service.list_datasets(current_user["id"])


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await dataset_service.get_dataset(dataset_id, current_user["id"])


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
async def preview_dataset(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    return await dataset_service.preview_dataset(dataset_id, current_user["id"])


@router.get("/{dataset_id}/columns", response_model=List[str])
async def get_dataset_columns(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    dataset = await dataset_service.get_dataset(dataset_id, current_user["id"])
    return dataset.get("column_names", [])



@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    await dataset_service.delete_dataset(dataset_id, current_user["id"])
