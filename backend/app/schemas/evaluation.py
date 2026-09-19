from typing import Any

from pydantic import BaseModel, Field


class EvaluationCase(BaseModel):
    id: str
    system: str
    input: dict[str, Any]
    expected_output: dict[str, Any]
    metadata: dict[str, Any] = Field(default_factory=dict)


class EvaluationResult(BaseModel):
    evaluator: str
    score: float | None = None
    passed: bool
    category: str | None = None
    reason: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class EvaluationRunRequest(BaseModel):
    case: EvaluationCase
    actual_output: dict[str, Any]
    evaluators: list[str]


class EvaluationRunResponse(BaseModel):
    case_id: str
    system: str
    results: list[EvaluationResult]
    average_score: float | None
    all_passed: bool