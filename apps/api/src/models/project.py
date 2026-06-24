from pydantic import BaseModel
from typing import Optional


class FundingRecord(BaseModel):
    program: str
    amount: Optional[float] = None
    year: Optional[int] = None
    purpose: Optional[str] = None


class MineralProject(BaseModel):
    id: str
    name: str
    operator: str
    minerals: list[str]
    primaryMineral: str
    stage: str
    status: str
    latitude: float
    longitude: float
    region: str
    province: str
    website: Optional[str] = None
    source: str
    nrcanObjectId: Optional[int] = None
    operationGroup: Optional[str] = None
    developmentStage: Optional[str] = None
    impactAssessmentUrl: Optional[str] = None
    funding: Optional[list[FundingRecord]] = None


class StatsResponse(BaseModel):
    totalProjects: int
    activeProjects: int
    fundedProjects: int
    byMineral: dict[str, int]
    byStage: dict[str, int]
    byRegion: dict[str, int]
