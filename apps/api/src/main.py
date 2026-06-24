import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import projects, stats
from .services.data_loader import reload_data

DATA_DIR = Path(__file__).parent / "data"

app = FastAPI(
    title="Critical Minerals Tracker API",
    description="REST API for Northern Ontario's critical minerals ecosystem. Data sourced directly from NRCan ArcGIS API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/sources")
async def sources():
    """Return metadata about data sources — when last synced, from where, licence info."""
    result = {}

    sync_log = DATA_DIR / "sync_log.json"
    if sync_log.exists():
        with open(sync_log) as f:
            result["nrcan"] = json.load(f)

    funding_meta = DATA_DIR / "funding_metadata.json"
    if funding_meta.exists():
        with open(funding_meta) as f:
            result["cmif"] = json.load(f)

    return result


@app.post("/api/reload")
async def reload():
    """Force reload data from disk (useful after running sync scripts)."""
    reload_data()
    return {"status": "reloaded"}
