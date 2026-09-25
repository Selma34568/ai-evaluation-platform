import os

from fastapi import APIRouter, HTTPException

from app.api.evaluations import engine
from app.schemas.dataset import Dataset, DatasetCreate, DatasetSummary
from app.schemas.dataset_evaluation import (
    DatasetEvaluationRequest,
    DatasetEvaluationResponse,
    SystemDatasetEvaluationRequest,
)
from app.services.dataset_manager import DatasetManager
from app.services.dataset_runner import DatasetRunner
from app.services.evaluation_history import EvaluationHistoryService
from app.services.system_dataset_runner import SystemDatasetRunner
from app.systems.ata_rag import AtaRagSystem
from app.systems.internship_coordinator import InternshipCoordinatorSystem
from app.systems.registry import SystemRegistry


router = APIRouter(
    prefix="/datasets",
    tags=["datasets"],
)


# ============================================================
# Services
# ============================================================

manager = DatasetManager()

runner = DatasetRunner(
    dataset_manager=manager,
    evaluation_engine=engine,
)

history_service = EvaluationHistoryService()


# ============================================================
# AI System Registry
# ============================================================

system_registry = SystemRegistry()


# ATA RAG
system_registry.register(
    AtaRagSystem(
        base_url=os.getenv(
            "ATA_RAG_BASE_URL",
            "http://127.0.0.1:8001",
        )
    )
)


# Agentic Internship Coordinator
system_registry.register(
    InternshipCoordinatorSystem(
        base_url=os.getenv(
            "INTERNSHIP_COORDINATOR_BASE_URL",
            "http://127.0.0.1:8002",
        )
    )
)


# ============================================================
# Automatic AI System Runner
# ============================================================

system_runner = SystemDatasetRunner(
    dataset_manager=manager,
    evaluation_engine=engine,
    system_registry=system_registry,
)


# ============================================================
# CREATE DATASET
# ============================================================

@router.post(
    "",
    response_model=Dataset,
    status_code=201,
)
def create_dataset(
    payload: DatasetCreate,
) -> Dataset:
    try:
        return manager.create_dataset(payload)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


# ============================================================
# LIST DATASETS
# ============================================================

@router.get(
    "",
    response_model=list[DatasetSummary],
)
def list_datasets() -> list[DatasetSummary]:
    return manager.list_datasets()


# ============================================================
# EVALUATION HISTORY
#
# IMPORTANT:
# These routes stay ABOVE /{dataset_id}.
# Otherwise FastAPI may interpret "history" as a dataset_id.
# ============================================================

@router.get("/history")
def list_evaluation_history():
    return history_service.list_history()


@router.get("/history/{history_id}")
def get_evaluation_history(
    history_id: str,
):
    result = history_service.get_history(history_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation history entry not found.",
        )

    return result


# ============================================================
# MANUAL DATASET EVALUATION
# ============================================================

@router.post(
    "/{dataset_id}/evaluate",
    response_model=DatasetEvaluationResponse,
)
def evaluate_dataset(
    dataset_id: str,
    payload: DatasetEvaluationRequest,
) -> DatasetEvaluationResponse:
    try:
        result = runner.run(
            dataset_id=dataset_id,
            request=payload,
        )

        history_service.save_result(
            result=result,
            mode="manual",
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


# ============================================================
# AUTOMATIC SYSTEM EVALUATION
# ============================================================

@router.post(
    "/{dataset_id}/run-system",
    response_model=DatasetEvaluationResponse,
)
async def run_dataset_against_system(
    dataset_id: str,
    payload: SystemDatasetEvaluationRequest,
) -> DatasetEvaluationResponse:
    try:
        result = await system_runner.run(
            dataset_id=dataset_id,
            request=payload,
        )

        history_service.save_result(
            result=result,
            mode="system",
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"AI system execution failed: {error}",
        ) from error


# ============================================================
# GET SINGLE DATASET
#
# Keep this route LAST because /{dataset_id} is dynamic.
# ============================================================

@router.get(
    "/{dataset_id}",
    response_model=Dataset,
)
def get_dataset(
    dataset_id: str,
) -> Dataset:
    dataset = manager.get_dataset(dataset_id)

    if dataset is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    return dataset