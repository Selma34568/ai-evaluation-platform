import os

from fastapi import APIRouter, HTTPException

from app.api.evaluations import engine

from app.schemas.dataset import (
    Dataset,
    DatasetCreate,
    DatasetSummary,
)

from app.schemas.dataset_evaluation import (
    DatasetEvaluationRequest,
    DatasetEvaluationResponse,
)

from app.schemas.system_evaluation import (
    SystemDatasetEvaluationRequest,
)

from app.schemas.evaluation_history import (
    EvaluationHistoryRecord,
)

from app.services.dataset_manager import DatasetManager
from app.services.dataset_runner import DatasetRunner
from app.services.system_dataset_runner import SystemDatasetRunner
from app.services.evaluation_history import EvaluationHistoryService

from app.systems.ata_rag import AtaRagSystem
from app.systems.registry import SystemRegistry


router = APIRouter(
    prefix="/datasets",
    tags=["datasets"],
)


manager = DatasetManager()

history_service = EvaluationHistoryService()


# Manual dataset runner

runner = DatasetRunner(
    dataset_manager=manager,
    evaluation_engine=engine,
)


# AI system registry

system_registry = SystemRegistry()

system_registry.register(
    AtaRagSystem(
        base_url=os.getenv(
            "ATA_RAG_BASE_URL",
            "http://127.0.0.1:8001",
        )
    )
)


# Automatic AI system runner

system_runner = SystemDatasetRunner(
    dataset_manager=manager,
    evaluation_engine=engine,
    system_registry=system_registry,
)


# Create dataset

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


# List datasets

@router.get(
    "",
    response_model=list[DatasetSummary],
)
def list_datasets() -> list[DatasetSummary]:

    return manager.list_datasets()


# Manual dataset evaluation

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

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    history_service.save_result(
        result=result,
        mode="manual",
    )

    return result


# Automatic AI system evaluation

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

    history_service.save_result(
        result=result,
        mode="system",
    )

    return result


# List evaluation history

@router.get(
    "/history",
    response_model=list[EvaluationHistoryRecord],
)
def list_evaluation_history():

    return history_service.list_history()


# Get evaluation history by ID

@router.get(
    "/history/{history_id}",
    response_model=EvaluationHistoryRecord,
)
def get_evaluation_history(
    history_id: str,
):

    record = history_service.get_history(history_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation history record not found.",
        )

    return record


# Get dataset by ID

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