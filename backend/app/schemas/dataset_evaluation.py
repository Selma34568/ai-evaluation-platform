from typing import Any

from pydantic import BaseModel, Field

from app.schemas.evaluation import EvaluationRunResponse


class DatasetEvaluationRequest(BaseModel):
    actual_outputs: dict[str, dict[str, Any]]
    evaluators: list[str]


class DatasetCaseEvaluationResult(BaseModel):
    case_id: str
    evaluation: EvaluationRunResponse


class DatasetEvaluationResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    system: str
    version: str

    total_cases: int
    passed_cases: int
    failed_cases: int

    average_score: float | None

    results: list[DatasetCaseEvaluationResult] = Field(
        default_factory=list
    )