from fastapi import APIRouter
from collections import Counter

from ..models.project import StatsResponse
from ..services.data_loader import load_projects

router = APIRouter()


@router.get("/summary", response_model=StatsResponse)
async def get_stats():
    projects = load_projects()

    active_projects = sum(1 for p in projects if p.status == "Active")
    funded_projects = sum(1 for p in projects if p.funding and len(p.funding) > 0)

    by_mineral = dict(Counter(p.primaryMineral for p in projects))
    by_stage = dict(Counter(p.stage for p in projects))
    by_region = dict(Counter(p.region for p in projects))

    return StatsResponse(
        totalProjects=len(projects),
        activeProjects=active_projects,
        fundedProjects=funded_projects,
        byMineral=by_mineral,
        byStage=by_stage,
        byRegion=by_region,
    )
