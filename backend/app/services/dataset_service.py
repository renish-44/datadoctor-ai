import os
import pandas as pd
from datetime import datetime
from fastapi import HTTPException, UploadFile, status

from app.config import settings
from app.database import datasets_collection
from app.models import DatasetModel


class DatasetService:
    async def upload_dataset(self, file: UploadFile, user_id: str, name: str = None) -> dict:
        allowed_types = [".csv", ".xlsx", ".xls", ".json"]
        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_types)}"
            )

        content = await file.read()
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
            )

        upload_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(content)

        try:
            df = self._read_file(file_path)
            column_names = df.columns.tolist()
            column_types = {col: str(dtype) for col, dtype in df.dtypes.items()}

            dataset = DatasetModel(
                user_id=str(user_id),
                name=name or file.filename,
                file_path=file_path,
                original_filename=file.filename,
                file_size_bytes=len(content),
                row_count=len(df),
                column_count=len(column_names),
                column_names=column_names,
                column_types=column_types,
                status="ready"
            )

            dataset_dict = dataset.model_dump()
            await datasets_collection.insert_one(dataset_dict)
            return dataset_dict

        except HTTPException:
            raise
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to parse file: {str(e)}"
            )

    async def list_datasets(self, user_id: str):
        cursor = datasets_collection.find({"user_id": str(user_id)}).sort("created_at", -1)
        datasets = await cursor.to_list(length=100)
        return datasets

    async def get_dataset(self, dataset_id: str, user_id: str) -> dict:
        dataset = await datasets_collection.find_one({"id": dataset_id, "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        return dataset

    async def preview_dataset(self, dataset_id: str, user_id: str):
        dataset = await self.get_dataset(dataset_id, user_id)
        df = self._read_file(dataset["file_path"])

        preview_data = df.head(100).to_dict(orient="records")
        for row in preview_data:
            for k, v in row.items():
                if pd.isna(v):
                    row[k] = None
                elif isinstance(v, (int, float)):
                    row[k] = v
                else:
                    row[k] = str(v)

        return {
            "columns": dataset["column_names"],
            "data": preview_data,
            "total_rows": dataset["row_count"]
        }

    async def delete_dataset(self, dataset_id: str, user_id: str):
        dataset = await self.get_dataset(dataset_id, user_id)
        if os.path.exists(dataset["file_path"]):
            os.remove(dataset["file_path"])
        await datasets_collection.delete_one({"id": dataset_id})

    def _read_file(self, file_path: str) -> pd.DataFrame:
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext == ".csv":
            return pd.read_csv(file_path)
        elif file_ext in [".xlsx", ".xls"]:
            return pd.read_excel(file_path)
        elif file_ext == ".json":
            return pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
