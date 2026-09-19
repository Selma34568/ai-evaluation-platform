import json

from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from app.schemas.dataset_evaluation import DatasetEvaluationResponse
from app.schemas.evaluation_history import EvaluationHistoryRecord


class EvaluationHistoryService:

    def __init__(
        self,
        storage_path: str | Path | None = None,
    ) -> None:

        if storage_path is None:
            backend_dir = Path(__file__).resolve().parents[2]

            storage_path = (
                backend_dir / "data" / "evaluation_history.json"
            )

        self.storage_path = Path(storage_path)

        self.storage_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        if not self.storage_path.exists():
            self.storage_path.write_text(
                "[]",
                encoding="utf-8",
            )

    def _load(
        self,
    ) -> list[EvaluationHistoryRecord]:

        data = json.loads(
            self.storage_path.read_text(
                encoding="utf-8"
            )
        )

        return [
            EvaluationHistoryRecord.model_validate(item)
            for item in data
        ]

    def _save(
        self,
        records: list[EvaluationHistoryRecord],
    ) -> None:

        data = [
            record.model_dump(mode="json")
            for record in records
        ]

        self.storage_path.write_text(
            json.dumps(
                data,
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

    def save_result(
        self,
        result: DatasetEvaluationResponse,
        mode: Literal["manual", "system"],
    ) -> EvaluationHistoryRecord:

        records = self._load()

        record = EvaluationHistoryRecord(
            id=str(uuid4()),
            created_at=datetime.now(timezone.utc),
            mode=mode,
            result=result,
        )

        records.append(record)

        self._save(records)

        return record

    def list_history(
        self,
    ) -> list[EvaluationHistoryRecord]:

        records = self._load()

        return sorted(
            records,
            key=lambda record: record.created_at,
            reverse=True,
        )

    def get_history(
        self,
        history_id: str,
    ) -> EvaluationHistoryRecord | None:

        records = self._load()

        for record in records:
            if record.id == history_id:
                return record

        return None