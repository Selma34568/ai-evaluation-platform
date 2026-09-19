from typing import Any

from app.core.evaluator import Evaluator
from app.schemas.evaluation import EvaluationCase, EvaluationResult


class RequiredFieldsEvaluator(Evaluator):
    name = "required_fields"

    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:

        required_fields = case.metadata.get("required_fields", [])

        missing_fields = [
            field
            for field in required_fields
            if field not in actual_output
            or actual_output[field] is None
            or actual_output[field] == ""
        ]

        passed = len(missing_fields) == 0
        total_fields = len(required_fields)

        if total_fields == 0:
            score = 1.0
        else:
            score = (total_fields - len(missing_fields)) / total_fields

        return EvaluationResult(
            evaluator=self.name,
            score=score,
            passed=passed,
            category="deterministic",
            reason=(
                "All required fields are present."
                if passed
                else f"Missing required fields: {', '.join(missing_fields)}"
            ),
            metadata={
                "required_fields": required_fields,
                "missing_fields": missing_fields,
            },
        )