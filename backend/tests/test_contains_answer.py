import pytest

from app.evaluators.contains_answer import ContainsAnswerEvaluator
from app.schemas.evaluation import EvaluationCase


@pytest.mark.parametrize(
    "expected, actual, should_pass",
    [
        (
            "Warsaw",
            "ATA University is located in Warsaw.",
            True,
        ),
        (
            "Warsaw",
            "ATA University is located in Krakow.",
            False,
        ),
        (
            "Warsaw",
            "ATA University is located in WARSAW.",
            True,
        ),
        (
            "Warsaw",
            "",
            False,
        ),
        (
            "Warsaw",
            "Warsawshire",
            False,
        ),
    ],
)
def test_contains_answer(expected, actual, should_pass):

    case = EvaluationCase(
        id="test-001",
        system="ata-rag",
        input={"question": "Where is ATA University located?"},
        expected_output={"answer": expected},
    )

    evaluator = ContainsAnswerEvaluator()

    result = evaluator.evaluate(
        case=case,
        actual_output={"answer": actual},
    )

    assert result.passed is should_pass
    assert result.score == (1.0 if should_pass else 0.0)