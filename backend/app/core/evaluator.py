from abc import ABC, abstractmethod
from typing import Any

from app.schemas.evaluation import EvaluationCase, EvaluationResult


class Evaluator(ABC):
    name: str

    @abstractmethod
    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:
        pass