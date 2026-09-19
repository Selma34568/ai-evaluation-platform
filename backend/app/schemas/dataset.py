from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.evaluation import EvaluationCase


class DatasetCreate(BaseModel):
    name: str
    system: str
    version: str
    description: str | None = None
    cases: list[EvaluationCase] = Field(default_factory=list)


class Dataset(BaseModel):
    id: str
    name: str
    system: str
    version: str
    description: str | None = None
    cases: list[EvaluationCase] = Field(default_factory=list)
    created_at: datetime


class DatasetSummary(BaseModel):
    id: str
    name: str
    system: str
    version: str
    case_count: int
    created_at: datetime