from typing import Any

from app.core.evaluator import Evaluator
from app.schemas.evaluation import (
    EvaluationCase,
    EvaluationResult,
    EvaluationRunResponse,
)


class EvaluationEngine:
    def __init__(self) -> None:
        self._evaluators: dict[str, Evaluator] = {}

    def register_evaluator(self, evaluator: Evaluator) -> None:
        self._evaluators[evaluator.name] = evaluator

    def get_available_evaluators(self) -> list[str]:
        return list(self._evaluators.keys())

    def run(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
        evaluator_names: list[str],
    ) -> EvaluationRunResponse:

        results: list[EvaluationResult] = []

        for evaluator_name in evaluator_names:
            evaluator = self._evaluators.get(evaluator_name)

            if evaluator is None:
                raise ValueError(
                    f"Evaluator '{evaluator_name}' is not registered."
                )

            result = evaluator.evaluate(
                case=case,
                actual_output=actual_output,
            )

            results.append(result)

        scores = [
            result.score
            for result in results
            if result.score is not None
        ]

        average_score = (
            sum(scores) / len(scores)
            if scores
            else None
        )

        all_passed = all(
            result.passed
            for result in results
        )

        return EvaluationRunResponse(
            case_id=case.id,
            system=case.system,
            results=results,
            average_score=average_score,
            all_passed=all_passed,
        )