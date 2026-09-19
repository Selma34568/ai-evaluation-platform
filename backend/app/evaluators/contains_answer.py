import re
from typing import Any

from app.core.evaluator import Evaluator
from app.schemas.evaluation import EvaluationCase, EvaluationResult


class ContainsAnswerEvaluator(Evaluator):
    name = "contains_answer"

    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:

        expected = case.expected_output.get("answer")
        actual = actual_output.get("answer")

        if not isinstance(expected, str) or not expected.strip():
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason="Expected answer is missing or invalid.",
            )

        if not isinstance(actual, str) or not actual.strip():
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason="Actual answer is missing or invalid.",
            )

        expected_normalized = " ".join(expected.casefold().split())
        actual_normalized = " ".join(actual.casefold().split())

        pattern = (
            rf"(?<!\w){re.escape(expected_normalized)}(?!\w)"
        )

        passed = re.search(pattern, actual_normalized) is not None

        return EvaluationResult(
            evaluator=self.name,
            score=1.0 if passed else 0.0,
            passed=passed,
            category="deterministic",
            reason=(
                "Expected answer was found in the actual answer."
                if passed
                else "Expected answer was not found in the actual answer."
            ),
            metadata={
                "expected_answer": expected,
                "actual_answer": actual,
            },
        )