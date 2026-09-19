from fastapi import APIRouter, HTTPException

from app.core.engine import EvaluationEngine

from app.evaluators.citation_exists import CitationExistsEvaluator
from app.evaluators.contains_answer import ContainsAnswerEvaluator
from app.evaluators.exact_match import ExactMatchEvaluator
from app.evaluators.json_schema import JsonSchemaEvaluator
from app.evaluators.latency_threshold import LatencyThresholdEvaluator
from app.evaluators.llm_judge import LLMJudgeEvaluator
from app.evaluators.required_fields import RequiredFieldsEvaluator

from app.schemas.evaluation import (
    EvaluationRunRequest,
    EvaluationRunResponse,
)


router = APIRouter(
    prefix="/evaluations",
    tags=["evaluations"],
)


# Initialize evaluation engine
engine = EvaluationEngine()


# Register evaluators
engine.register_evaluator(ExactMatchEvaluator())
engine.register_evaluator(RequiredFieldsEvaluator())
engine.register_evaluator(CitationExistsEvaluator())
engine.register_evaluator(LatencyThresholdEvaluator())
engine.register_evaluator(JsonSchemaEvaluator())
engine.register_evaluator(ContainsAnswerEvaluator())
engine.register_evaluator(LLMJudgeEvaluator())


@router.get("/evaluators")
def get_evaluators():
    return {
        "evaluators": engine.get_available_evaluators()
    }


@router.post(
    "/run",
    response_model=EvaluationRunResponse,
)
def run_evaluation(
    request: EvaluationRunRequest,
) -> EvaluationRunResponse:
    try:
        return engine.run(
            case=request.case,
            actual_output=request.actual_output,
            evaluator_names=request.evaluators,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error