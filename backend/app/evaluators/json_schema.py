from typing import Any

from jsonschema import SchemaError, ValidationError, validate

from app.core.evaluator import Evaluator
from app.schemas.evaluation import EvaluationCase, EvaluationResult


class JsonSchemaEvaluator(Evaluator):
    name = "json_schema"

    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:

        output_schema = case.metadata.get(
            "output_schema"
        )

        if output_schema is None:
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason="No output schema was configured.",
                metadata={},
            )

        try:
            validate(
                instance=actual_output,
                schema=output_schema,
            )

            return EvaluationResult(
                evaluator=self.name,
                score=1.0,
                passed=True,
                category="deterministic",
                reason="Actual output matches the configured JSON schema.",
                metadata={},
            )

        except ValidationError as error:
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason=f"JSON schema validation failed: {error.message}",
                metadata={
                    "validation_path": list(error.path),
                },
            )

        except SchemaError as error:
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason=f"Invalid JSON schema configuration: {error.message}",
                metadata={},
            )