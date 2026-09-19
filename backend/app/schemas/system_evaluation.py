from pydantic import BaseModel


class SystemDatasetEvaluationRequest(BaseModel):
    evaluators: list[str]