from fastapi import APIRouter

from app.schemas.dashboard import (
    DashboardSummary,
    RecentEvaluation,
)

from app.services.evaluation_history import (
    EvaluationHistoryService,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


history_service = EvaluationHistoryService()


@router.get(
    "/summary",
    response_model=DashboardSummary,
)
def get_dashboard_summary() -> DashboardSummary:

    records = history_service.list_history()

    total_runs = len(records)

    total_cases = sum(
        record.result.total_cases
        for record in records
    )

    passed_cases = sum(
        record.result.passed_cases
        for record in records
    )

    failed_cases = sum(
        record.result.failed_cases
        for record in records
    )

    pass_rate = (
        round(passed_cases / total_cases * 100, 2)
        if total_cases > 0
        else 0.0
    )

    scored_records = [
        record
        for record in records
        if record.result.average_score is not None
        and record.result.total_cases > 0
    ]

    scored_cases = sum(
        record.result.total_cases
        for record in scored_records
    )

    average_score = (
        round(
            sum(
                record.result.average_score
                * record.result.total_cases
                for record in scored_records
            ) / scored_cases,
            4,
        )
        if scored_cases > 0
        else None
    )

    sorted_records = sorted(
        records,
        key=lambda record: record.created_at,
        reverse=True,
    )

    recent_evaluations = [
        RecentEvaluation(
            id=record.id,
            dataset_name=record.result.dataset_name,
            system=record.result.system,
            version=record.result.version,
            mode=record.mode,
            created_at=record.created_at,
            total_cases=record.result.total_cases,
            passed_cases=record.result.passed_cases,
            failed_cases=record.result.failed_cases,
            average_score=record.result.average_score,
        )
        for record in sorted_records[:5]
    ]

    return DashboardSummary(
        total_runs=total_runs,
        total_cases=total_cases,
        passed_cases=passed_cases,
        failed_cases=failed_cases,
        pass_rate=pass_rate,
        average_score=average_score,
        recent_evaluations=recent_evaluations,
    )