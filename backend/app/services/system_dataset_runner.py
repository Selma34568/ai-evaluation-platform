import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from langfuse import get_client

from app.core.engine import EvaluationEngine
from app.schemas.dataset_evaluation import (
    DatasetCaseEvaluationResult,
    DatasetEvaluationResponse,
)
from app.schemas.system_evaluation import SystemDatasetEvaluationRequest
from app.services.dataset_manager import DatasetManager
from app.systems.registry import SystemRegistry


logger = logging.getLogger(__name__)

# Load Langfuse credentials from backend/.env
load_dotenv(
    Path(__file__).resolve().parents[2] / ".env"
)


class SystemDatasetRunner:

    def __init__(
        self,
        dataset_manager: DatasetManager,
        evaluation_engine: EvaluationEngine,
        system_registry: SystemRegistry,
    ) -> None:

        self.dataset_manager = dataset_manager
        self.evaluation_engine = evaluation_engine
        self.system_registry = system_registry

    async def run(
        self,
        dataset_id: str,
        request: SystemDatasetEvaluationRequest,
    ) -> DatasetEvaluationResponse:

        dataset = self.dataset_manager.get_dataset(dataset_id)

        if dataset is None:
            raise ValueError(
                f"Dataset '{dataset_id}' was not found."
            )

        system = self.system_registry.get(dataset.system)

        if system is None:
            raise ValueError(
                f"AI system '{dataset.system}' is not registered."
            )

        # Initialize Langfuse without breaking evaluation
        langfuse = None

        if (
            os.getenv("LANGFUSE_PUBLIC_KEY")
            and os.getenv("LANGFUSE_SECRET_KEY")
        ):
            try:
                langfuse = get_client()

            except Exception:
                logger.exception(
                    "Langfuse initialization failed."
                )
        else:
            logger.warning(
                "Langfuse credentials are missing."
            )

        results: list[DatasetCaseEvaluationResult] = []

        passed_cases = 0
        failed_cases = 0
        scores: list[float] = []

        for case in dataset.cases:

            # Run the actual AI system
            actual_output = await system.run(
                case.input
            )

            # Evaluate the AI response
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
                scores.append(
                    evaluation.average_score
                )

            results.append(
                DatasetCaseEvaluationResult(
                    case_id=case.id,
                    evaluation=evaluation,
                )
            )

            # Send evaluation results to Langfuse
            if langfuse is not None:

                try:

                    with langfuse.start_as_current_observation(
                        as_type="span",
                        name="evalai-dataset-case",
                        input=case.input,
                        output=actual_output,
                        metadata={
                            "dataset_id": dataset.id,
                            "dataset_name": dataset.name,
                            "system": dataset.system,
                            "version": dataset.version,
                            "case_id": case.id,
                            "expected_output": case.expected_output,
                        },
                    ) as span:

                        # Record individual evaluator scores
                        for item in evaluation.results:

                            span.score(
                                name=item.evaluator,
                                value=float(item.score),
                                data_type="NUMERIC",
                                comment=item.reason,
                            )

                        # Record overall case result
                        span.score(
                            name="case_passed",
                            value=float(evaluation.all_passed),
                            data_type="BOOLEAN",
                        )

                        if evaluation.average_score is not None:

                            span.score(
                                name="average_score",
                                value=float(
                                    evaluation.average_score
                                ),
                                data_type="NUMERIC",
                            )

                except Exception:

                    logger.exception(
                        "Failed to record Langfuse results "
                        "for case %s.",
                        case.id,
                    )

        # Calculate the dataset average
        average_score = (
            sum(scores) / len(scores)
            if scores
            else None
        )

        # Flush pending Langfuse events
        if langfuse is not None:

            try:
                langfuse.flush()

            except Exception:
                logger.exception(
                    "Langfuse flush failed."
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