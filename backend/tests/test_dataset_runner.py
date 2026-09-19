from pathlib import Path

from app.core.engine import EvaluationEngine
from app.evaluators.exact_match import ExactMatchEvaluator
from app.evaluators.required_fields import RequiredFieldsEvaluator
from app.schemas.dataset import DatasetCreate
from app.schemas.dataset_evaluation import DatasetEvaluationRequest
from app.schemas.evaluation import EvaluationCase
from app.services.dataset_manager import DatasetManager
from app.services.dataset_runner import DatasetRunner


def test_dataset_runner_passes(tmp_path: Path):
    storage_file = tmp_path / "datasets.json"

    manager = DatasetManager(
        storage_path=str(storage_file)
    )

    engine = EvaluationEngine()
    engine.register_evaluator(ExactMatchEvaluator())
    engine.register_evaluator(RequiredFieldsEvaluator())

    runner = DatasetRunner(
        dataset_manager=manager,
        evaluation_engine=engine,
    )

    dataset = manager.create_dataset(
        DatasetCreate(
            name="Test Dataset",
            system="ata-rag",
            version="v1",
            cases=[
                EvaluationCase(
                    id="ata-001",
                    system="ata-rag",
                    input={
                        "question": "Where is ATA University located?"
                    },
                    expected_output={
                        "answer": "Warsaw"
                    },
                    metadata={
                        "required_fields": ["answer"]
                    },
                )
            ],
        )
    )

    request = DatasetEvaluationRequest(
        actual_outputs={
            "ata-001": {
                "answer": "Warsaw"
            }
        },
        evaluators=[
            "exact_match",
            "required_fields",
        ],
    )

    result = runner.run(
        dataset_id=dataset.id,
        request=request,
    )

    assert result.total_cases == 1
    assert result.passed_cases == 1
    assert result.failed_cases == 0
    assert result.average_score == 1.0