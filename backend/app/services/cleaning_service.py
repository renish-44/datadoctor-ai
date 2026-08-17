import os
import pandas as pd
from datetime import datetime
from fastapi import HTTPException, status

from app.database import datasets_collection, cleaning_jobs_collection
from app.models import CleaningJobModel


class CleaningService:
    async def apply_cleaning(self, dataset_id: str, user_id: str, cleaning_request) -> dict:
        dataset = await datasets_collection.find_one({"id": dataset_id, "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        df = self._read_file(dataset["file_path"])

        job = CleaningJobModel(
            dataset_id=dataset_id,
            rows_before=len(df),
            columns_before=len(df.columns),
            status="running",
            started_at=datetime.utcnow()
        )
        job_dict = job.model_dump()
        await cleaning_jobs_collection.insert_one(job_dict)

        try:
            operations_log = []
            for op in cleaning_request.operations:
                result = self._apply_operation(df, op.operation, op.params)
                df = result["dataframe"]
                operations_log.append({
                    "operation": op.operation,
                    "params": op.params,
                    "affected_rows": result["affected_rows"]
                })

            base, ext = os.path.splitext(dataset["file_path"])
            result_path = f"{base}_cleaned{ext}"
            df.to_csv(result_path, index=False)

            update_fields = {
                "operations": operations_log,
                "status": "completed",
                "result_file": result_path,
                "rows_after": len(df),
                "columns_after": len(df.columns),
                "completed_at": datetime.utcnow()
            }
            await cleaning_jobs_collection.update_one({"id": job.id}, {"$set": update_fields})
            job_dict.update(update_fields)
            return job_dict

        except Exception as e:
            await cleaning_jobs_collection.update_one(
                {"id": job.id},
                {"$set": {"status": "failed", "error_message": str(e), "completed_at": datetime.utcnow()}}
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cleaning failed: {str(e)}"
            )

    async def list_history(self, dataset_id: str, user_id: str):
        dataset = await datasets_collection.find_one({"id": dataset_id, "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        cursor = cleaning_jobs_collection.find({"dataset_id": dataset_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def undo_job(self, job_id: str, user_id: str):
        job = await cleaning_jobs_collection.find_one({"id": job_id})
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cleaning job not found")

        dataset = await datasets_collection.find_one({"id": job["dataset_id"], "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        if job["status"] != "completed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only undo completed jobs")

        await cleaning_jobs_collection.update_one({"id": job_id}, {"$set": {"status": "undone"}})
        job["status"] = "undone"
        return job

    def _read_file(self, file_path: str) -> pd.DataFrame:
        import os
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext == ".csv":
            return pd.read_csv(file_path)
        elif file_ext in [".xlsx", ".xls"]:
            return pd.read_excel(file_path)
        elif file_ext == ".json":
            return pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

    def _apply_operation(self, df: pd.DataFrame, operation: str, params: dict) -> dict:
        if operation == "drop_duplicates":
            before = len(df)
            df = df.drop_duplicates(subset=params.get("subset"), keep=params.get("keep", "first"))
            return {"dataframe": df, "affected_rows": before - len(df)}

        elif operation in ("fill_missing_mean", "fill_missing"):
            col = params.get("column")
            if col and col in df.columns:
                df[col] = df[col].fillna(df[col].mean())
            return {"dataframe": df, "affected_rows": 0}

        elif operation == "fill_missing_median":
            col = params.get("column")
            if col and col in df.columns:
                df[col] = df[col].fillna(df[col].median())
            return {"dataframe": df, "affected_rows": 0}

        elif operation == "drop_missing":
            before = len(df)
            df = df.dropna()
            return {"dataframe": df, "affected_rows": before - len(df)}

        elif operation == "drop_columns":
            df = df.drop(columns=params["columns"], errors="ignore")
            return {"dataframe": df, "affected_rows": 0}

        elif operation == "rename_column":
            df = df.rename(columns={params["old_name"]: params["new_name"]})
            return {"dataframe": df, "affected_rows": 0}

        elif operation == "string_clean":
            col = params["column"]
            for op in params.get("operations", []):
                if op == "trim":
                    df[col] = df[col].str.strip()
                elif op == "lower":
                    df[col] = df[col].str.lower()
                elif op == "upper":
                    df[col] = df[col].str.upper()
            return {"dataframe": df, "affected_rows": 0}

        else:
            raise ValueError(f"Unknown operation: {operation}")
