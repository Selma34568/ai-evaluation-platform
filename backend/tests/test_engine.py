from app.core.engine import EvaluationEngine
from app.evaluators.citation_exists import CitationExistsEvaluator
from app.evaluators.exact_match import ExactMatchEvaluator
from app.evaluators.json_schema import JsonSchemaEvaluator
from app.evaluators.latency_threshold import LatencyThresholdEvaluator
from app.evaluators.required_fields import RequiredFieldsEvaluator
from app.schemas.evaluation import EvaluationCase


def create_engine() -> EvaluationEngine:
    engine = EvaluationEngine()

    engine.register_evaluator(ExactMatchEvaluator())
    engine.register_evaluator(RequiredFieldsEvaluator())
    engine.register_evaluator(CitationExistsEvaluator())
    engine.register_evaluator(LatencyThresholdEvaluator())
    engine.register_evaluator(JsonSchemaEvaluator())

    return engine


def test_exact_match_passes():
    engine = create_engine()

    case = EvaluationCase(
        id="test-001",
        system="test-system",
        input={"question": "Test question"},
        expected_output={"answer": "Warsaw"},
    )

    result = engine.run(
        case=case,
        actual_output={"answer": "Warsaw"},
        evaluator_names=["exact_match"],
    )

    assert result.all_passed is True
    assert result.average_score == 1.0


def test_exact_match_fails():
    engine = create_engine()

    case = EvaluationCase(
        id="test-002",
        system="test-system",
        input={"question": "Test question"},
        expected_output={"answer": "Warsaw"},
    )

    result = engine.run(
        case=case,
        actual_output={"answer": "Krakow"},
        evaluator_names=["exact_match"],
    )

    assert result.all_passed is False
    assert result.average_score == 0.0


def test_required_fields_fails():
    engine = create_engine()

    case = EvaluationCase(
        id="test-003",
        system="test-system",
        input={},
        expected_output={},
        metadata={
            "required_fields": [
                "answer",
                "source",
            ]
        },
    )

    result = engine.run(
        case=case,
        actual_output={
            "answer": "Warsaw"
        },
        evaluator_names=["required_fields"],
    )

    assert result.all_passed is False
    assert result.results[0].score == 0.5


def test_citation_exists_passes():
    engine = create_engine()

    case = EvaluationCase(
        id="test-004",
        system="ata-rag",
        input={},
        expected_output={},
    )

    result = engine.run(
        case=case,
        actual_output={
            "answer": "Warsaw",
            "citations": [
                "https://example.com/source"
            ],
        },
        evaluator_names=["citation_exists"],
    )

    assert result.all_passed is True
    assert result.results[0].score == 1.0


def test_latency_threshold_fails():
    engine = create_engine()

    case = EvaluationCase(
        id="test-005",
        system="ata-rag",
        input={},
        expected_output={},
        metadata={
            "max_latency_ms": 2000,
        },
    )

    result = engine.run(
        case=case,
        actual_output={
            "answer": "Warsaw",
            "latency_ms": 2500,
        },
        evaluator_names=["latency_threshold"],
    )

    assert result.all_passed is False
    assert result.results[0].score == 0.0


def test_json_schema_passes():
    engine = create_engine()

    case = EvaluationCase(
        id="test-006",
        system="ata-rag",
        input={},
        expected_output={},
        metadata={
            "output_schema": {
                "type": "object",
                "properties": {
                    "answer": {
                        "type": "string"
                    }
                },
                "required": ["answer"],
            }
        },
    )

    result = engine.run(
        case=case,
        actual_output={
            "answer": "Warsaw"
        },
        evaluator_names=["json_schema"],
    )

    assert result.all_passed is True
    assert result.results[0].score == 1.0