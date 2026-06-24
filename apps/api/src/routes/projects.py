from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from ..models.project import MineralProject
from ..services.data_loader import load_projects

router = APIRouter()


@router.get("", response_model=list[MineralProject])
async def list_projects(
    mineral: Optional[str] = Query(None, description="Filter by primary mineral"),
    stage: Optional[str] = Query(None, description="Filter by development stage"),
    region: Optional[str] = Query(None, description="Filter by region (partial match)"),
    province: Optional[str] = Query(None, description="Filter by province (partial match)"),
    operator: Optional[str] = Query(None, description="Filter by operator (partial match)"),
    status: Optional[str] = Query(None, description="Filter by activity status"),
    funded: Optional[bool] = Query(None, description="Only show government-funded projects"),
):
    projects = load_projects()

    if mineral:
        projects = [p for p in projects if p.primaryMineral.lower() == mineral.lower()]
    if stage:
        projects = [p for p in projects if p.stage.lower() == stage.lower()]
    if region:
        projects = [p for p in projects if region.lower() in p.region.lower()]
    if province:
        projects = [p for p in projects if province.lower() in p.province.lower()]
    if operator:
        projects = [p for p in projects if operator.lower() in p.operator.lower()]
    if status:
        projects = [p for p in projects if p.status.lower() == status.lower()]
    if funded is True:
        projects = [p for p in projects if p.funding and len(p.funding) > 0]

    return projects


@router.get("/{project_id}", response_model=MineralProject)
async def get_project(project_id: str):
    projects = load_projects()
    for p in projects:
        if p.id == project_id:
            return p
    raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
