from typing import Any

from app.core.evaluator import Evaluator
from app.schemas.evaluation import EvaluationCase, EvaluationResult


class ExactMatchEvaluator(Evaluator):
    name = "exact_match"

    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:

        passed = actual_output == case.expected_output

        return EvaluationResult(
            evaluator=self.name,
            score=1.0 if passed else 0.0,
            passed=passed,
            category="deterministic",
            reason=(
                "Actual output exactly matches the expected output."
                if passed
                else "Actual output does not exactly match the expected output."
            ),
            metadata={
                "expected_output": case.expected_output,
                "actual_output": actual_output,
            },
        )