import pandas as pd
from datetime import datetime
from fastapi import HTTPException, status

from app.database import datasets_collection, audit_reports_collection
from app.models import AuditReportModel


class AuditService:
    async def run_audit(self, dataset_id: str, user_id: str) -> dict:
        dataset = await datasets_collection.find_one({"id": dataset_id, "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        df = self._read_file(dataset["file_path"])

        report_data = self._analyze_dataset(df)
        issues_found = self._count_issues(report_data)
        severity = self._determine_severity(issues_found, len(df))
        summary = self._generate_summary(report_data, len(df))

        report = AuditReportModel(
            dataset_id=dataset_id,
            report_data=report_data,
            summary=summary,
            row_count=len(df),
            column_count=len(df.columns),
            issues_found=issues_found,
            severity=severity
        )

        report_dict = report.model_dump()
        await audit_reports_collection.insert_one(report_dict)
        return report_dict

    async def list_reports(self, dataset_id: str, user_id: str):
        dataset = await datasets_collection.find_one({"id": dataset_id, "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        cursor = audit_reports_collection.find({"dataset_id": dataset_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def get_report(self, report_id: str, user_id: str):
        report = await audit_reports_collection.find_one({"id": report_id})
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        dataset = await datasets_collection.find_one({"id": report["dataset_id"], "user_id": str(user_id)})
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        return report

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

    def _analyze_dataset(self, df: pd.DataFrame) -> dict:
        return {
            "missing_values": self._analyze_missing(df),
            "duplicates": self._analyze_duplicates(df),
            "statistics": self._compute_statistics(df)
        }

    def _analyze_missing(self, df: pd.DataFrame) -> dict:
        total_missing = int(df.isnull().sum().sum())
        columns = {}
        for col in df.columns:
            count = int(df[col].isnull().sum())
            if count > 0:
                columns[col] = {"count": count, "percentage": round(count / len(df) * 100, 2)}
        return {"total_missing": total_missing, "columns": columns}

    def _analyze_duplicates(self, df: pd.DataFrame) -> dict:
        exact_duplicates = int(df.duplicated().sum())
        return {
            "exact_duplicates": exact_duplicates,
            "duplicate_percentage": round(exact_duplicates / len(df) * 100, 2),
            "duplicate_column_groups": []
        }

    def _compute_statistics(self, df: pd.DataFrame) -> dict:
        numeric = {}
        for col in df.select_dtypes(include=['number']).columns:
            stats = df[col].describe()
            numeric[col] = {
                "mean": round(float(stats.get('mean', 0)), 4),
                "median": round(float(df[col].median()), 4),
                "std": round(float(stats.get('std', 0)), 4),
                "min": round(float(stats.get('min', 0)), 4),
                "max": round(float(stats.get('max', 0)), 4)
            }

        categorical = {}
        for col in df.select_dtypes(include=['object', 'category']).columns:
            value_counts = df[col].value_counts()
            categorical[col] = {
                "unique": int(df[col].nunique()),
                "top": str(value_counts.index[0]) if len(value_counts) > 0 else None,
                "top_count": int(value_counts.iloc[0]) if len(value_counts) > 0 else 0
            }

        return {"numeric": numeric, "categorical": categorical}

    def _count_issues(self, report_data: dict) -> int:
        issues = len(report_data.get("missing_values", {}).get("columns", {}))
        if report_data.get("duplicates", {}).get("exact_duplicates", 0) > 0:
            issues += 1
        return issues

    def _determine_severity(self, issues_found: int, total_rows: int) -> str:
        if issues_found == 0:
            return "info"
        if issues_found <= 3:
            return "warning"
        return "critical"

    def _generate_summary(self, report_data: dict, total_rows: int) -> str:
        missing = report_data.get("missing_values", {}).get("total_missing", 0)
        duplicates = report_data.get("duplicates", {}).get("exact_duplicates", 0)
        parts = []
        if missing > 0:
            parts.append(f"{missing} missing values detected")
        if duplicates > 0:
            parts.append(f"{duplicates} duplicate rows found")
        if not parts:
            return "Dataset appears clean with no significant issues."
        return f"Audit complete: {'; '.join(parts)}."
