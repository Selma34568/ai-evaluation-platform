from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.dataset_evaluation import DatasetEvaluationResponse


class EvaluationHistoryRecord(BaseModel):
    id: str
    created_at: datetime
    mode: Literal["manual", "system"]

    result: DatasetEvaluationResponse