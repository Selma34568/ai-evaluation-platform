from typing import Any

from app.core.evaluator import Evaluator
from app.schemas.evaluation import EvaluationCase, EvaluationResult


class LatencyThresholdEvaluator(Evaluator):
    name = "latency_threshold"

    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:

        max_latency_ms = case.metadata.get(
            "max_latency_ms"
        )

        latency_field = case.metadata.get(
            "latency_field",
            "latency_ms",
        )

        actual_latency = actual_output.get(
            latency_field
        )

        if max_latency_ms is None:
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason="No maximum latency threshold was configured.",
                metadata={},
            )

        if actual_latency is None:
            return EvaluationResult(
                evaluator=self.name,
                score=0.0,
                passed=False,
                category="deterministic",
                reason=f"Latency field '{latency_field}' is missing.",
                metadata={
                    "max_latency_ms": max_latency_ms,
                },
            )

        passed = actual_latency <= max_latency_ms

        return EvaluationResult(
            evaluator=self.name,
            score=1.0 if passed else 0.0,
            passed=passed,
            category="deterministic",
            reason=(
                f"Latency {actual_latency} ms is within the "
                f"{max_latency_ms} ms threshold."
                if passed
                else
                f"Latency {actual_latency} ms exceeds the "
                f"{max_latency_ms} ms threshold."
            ),
            metadata={
                "actual_latency_ms": actual_latency,
                "max_latency_ms": max_latency_ms,
            },
        )