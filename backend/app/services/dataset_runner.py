from app.core.engine import EvaluationEngine
from app.schemas.dataset_evaluation import (
    DatasetCaseEvaluationResult,
    DatasetEvaluationRequest,
    DatasetEvaluationResponse,
)
from app.services.dataset_manager import DatasetManager


class DatasetRunner:
    def __init__(
        self,
        dataset_manager: DatasetManager,
        evaluation_engine: EvaluationEngine,
    ) -> None:
        self.dataset_manager = dataset_manager
        self.evaluation_engine = evaluation_engine

    def run(
        self,
        dataset_id: str,
        request: DatasetEvaluationRequest,
    ) -> DatasetEvaluationResponse:

        dataset = self.dataset_manager.get_dataset(dataset_id)

        if dataset is None:
            raise ValueError(
                f"Dataset '{dataset_id}' was not found."
            )

        results: list[DatasetCaseEvaluationResult] = []

        passed_cases = 0
        failed_cases = 0
        scores: list[float] = []

        for case in dataset.cases:
            actual_output = request.actual_outputs.get(case.id)

            if actual_output is None:
                failed_cases += 1
                continue

            evaluation = self.evaluation_engine.run(
                case=case,
                actual_output=actual_output,
                evaluator_names=request.evaluators,
            )

            if evaluation.all_passed:
                passed_cases += 1
            else:
                failed_cases += 1

            if evaluation.average_score is not None:
                scores.append(evaluation.average_score)

            results.append(
                DatasetCaseEvaluationResult(
                    case_id=case.id,
                    evaluation=evaluation,
                )
            )

        average_score = (
            sum(scores) / len(scores)
            if scores
            else None
        )

        return DatasetEvaluationResponse(
            dataset_id=dataset.id,
            dataset_name=dataset.name,
            system=dataset.system,
            version=dataset.version,
            total_cases=len(dataset.cases),
            passed_cases=passed_cases,
            failed_cases=failed_cases,
            average_score=average_score,
            results=results,
        )