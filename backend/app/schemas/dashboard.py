from datetime import datetime

from pydantic import BaseModel, Field


class RecentEvaluation(BaseModel):
    id: str
    dataset_name: str
    system: str
    version: str
    mode: str
    created_at: datetime

    total_cases: int
    passed_cases: int
    failed_cases: int

    average_score: float | None


class DashboardSummary(BaseModel):
    total_runs: int = 0
    total_cases: int = 0
    passed_cases: int = 0
    failed_cases: int = 0

    pass_rate: float = 0.0
    average_score: float | None = None

    recent_evaluations: list[RecentEvaluation] = Field(
        default_factory=list
    )