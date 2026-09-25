from typing import Any

from pydantic import BaseModel, Field

from app.schemas.evaluation import EvaluationRunResponse


class DatasetEvaluationRequest(BaseModel):
    """
    Request body for evaluating already-produced outputs
    against an evaluation dataset.
    """

    actual_outputs: dict[str, dict[str, Any]] = Field(
        default_factory=dict
    )

    evaluators: list[str] = Field(
        default_factory=list
    )


class SystemDatasetEvaluationRequest(BaseModel):
    """
    Request body for automatically running a dataset
    against its registered AI system.
    """

    evaluators: list[str] = Field(
        default_factory=list
    )


class DatasetCaseEvaluationResult(BaseModel):
    """
    Evaluation result for a single dataset case.
    """

    case_id: str
    evaluation: EvaluationRunResponse


class DatasetEvaluationResponse(BaseModel):
    """
    Aggregate evaluation result for a complete dataset.
    """

    dataset_id: str
    dataset_name: str
    system: str
    version: str

    total_cases: int
    passed_cases: int
    failed_cases: int

    average_score: float | None = None

    results: list[DatasetCaseEvaluationResult] = Field(
        default_factory=list
    )