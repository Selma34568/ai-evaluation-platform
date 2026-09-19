from typing import Any

from app.core.evaluator import Evaluator
from app.schemas.evaluation import EvaluationCase, EvaluationResult


class CitationExistsEvaluator(Evaluator):
    name = "citation_exists"

    def evaluate(
        self,
        case: EvaluationCase,
        actual_output: dict[str, Any],
    ) -> EvaluationResult:

        citation_field = case.metadata.get(
            "citation_field",
            "citations",
        )

        citations = actual_output.get(citation_field)

        if isinstance(citations, str):
            passed = bool(citations.strip())
        elif isinstance(citations, (list, dict)):
            passed = len(citations) > 0
        else:
            passed = citations is not None

        return EvaluationResult(
            evaluator=self.name,
            score=1.0 if passed else 0.0,
            passed=passed,
            category="deterministic",
            reason=(
                f"Citation field '{citation_field}' contains citation data."
                if passed
                else f"No citation data found in field '{citation_field}'."
            ),
            metadata={
                "citation_field": citation_field,
                "citations": citations,
            },
        )