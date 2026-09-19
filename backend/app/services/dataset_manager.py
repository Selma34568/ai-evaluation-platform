import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from app.schemas.dataset import (
    Dataset,
    DatasetCreate,
    DatasetSummary,
)


class DatasetManager:
    def __init__(
        self,
        storage_path: str = "data/datasets.json",
    ) -> None:
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

    def _load_datasets(self) -> list[Dataset]:
        raw_data = json.loads(
            self.storage_path.read_text(
                encoding="utf-8"
            )
        )

        return [
            Dataset.model_validate(item)
            for item in raw_data
        ]

    def _save_datasets(
        self,
        datasets: list[Dataset],
    ) -> None:
        data = [
            dataset.model_dump(mode="json")
            for dataset in datasets
        ]

        self.storage_path.write_text(
            json.dumps(
                data,
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

    def create_dataset(
        self,
        payload: DatasetCreate,
    ) -> Dataset:
        datasets = self._load_datasets()

        duplicate = any(
            dataset.system == payload.system
            and dataset.version == payload.version
            for dataset in datasets
        )

        if duplicate:
            raise ValueError(
                f"Dataset version '{payload.version}' "
                f"already exists for system "
                f"'{payload.system}'."
            )

        case_ids = [
            case.id
            for case in payload.cases
        ]

        if len(case_ids) != len(set(case_ids)):
            raise ValueError(
                "Evaluation case IDs must be unique "
                "inside a dataset."
            )

        dataset = Dataset(
            id=str(uuid4()),
            name=payload.name,
            system=payload.system,
            version=payload.version,
            description=payload.description,
            cases=payload.cases,
            created_at=datetime.now(timezone.utc),
        )

        datasets.append(dataset)

        self._save_datasets(datasets)

        return dataset

    def list_datasets(
        self,
    ) -> list[DatasetSummary]:
        datasets = self._load_datasets()

        return [
            DatasetSummary(
                id=dataset.id,
                name=dataset.name,
                system=dataset.system,
                version=dataset.version,
                case_count=len(dataset.cases),
                created_at=dataset.created_at,
            )
            for dataset in datasets
        ]

    def get_dataset(
        self,
        dataset_id: str,
    ) -> Dataset | None:
        datasets = self._load_datasets()

        for dataset in datasets:
            if dataset.id == dataset_id:
                return dataset

        return None