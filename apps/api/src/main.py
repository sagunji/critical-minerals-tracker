import json
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .routes import projects, stats
from .services.data_loader import reload_data

DATA_DIR = Path(__file__).parent / "data"
HISTORY_DIR = DATA_DIR / "history"

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


@app.get("/api/history")
async def history(date: str = Query(None, description="Specific date (YYYY-MM-DD) to retrieve")):
    """List available historical snapshots, or retrieve a specific one."""
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)

    if date:
        path = HISTORY_DIR / f"minerals_{date}.json"
        if not path.exists():
            return {"error": f"No snapshot for {date}"}
        with open(path) as f:
            return {"date": date, "projects": json.load(f)}

    snapshots = sorted(HISTORY_DIR.glob("minerals_*.json"))
    entries = []
    for snap in snapshots:
        date_str = snap.stem.replace("minerals_", "")
        entries.append({
            "date": date_str,
            "size_bytes": snap.stat().st_size,
        })

    return {
        "total_snapshots": len(entries),
        "snapshots": entries,
    }


@app.get("/api/changelog")
async def changelog(
    limit: int = Query(10, description="Max entries to return"),
    project_id: str = Query(None, description="Filter changes for a specific project"),
):
    """Return recent changes detected across syncs."""
    from .services.diff_engine import load_changelog

    all_entries = load_changelog()

    if project_id:
        filtered = []
        for entry in all_entries:
            matching_changes = [c for c in entry["changes"] if c["project_id"] == project_id]
            if matching_changes:
                filtered.append({
                    **entry,
                    "changes": matching_changes,
                    "total_changes": len(matching_changes),
                })
        all_entries = filtered

    recent = all_entries[-limit:]
    recent.reverse()

    return {
        "total_entries": len(all_entries),
        "entries": recent,
    }


@app.get("/api/changelog/diff")
async def changelog_diff(
    old_date: str = Query(..., description="Earlier snapshot date (YYYY-MM-DD)"),
    new_date: str = Query(..., description="Later snapshot date (YYYY-MM-DD)"),
):
    """Compare any two historical snapshots on-demand."""
    from .services.diff_engine import generate_changelog_entry

    entry = generate_changelog_entry(old_date, new_date)
    return entry


@app.post("/api/reload")
async def reload():
    """Force reload data from disk (useful after running sync scripts)."""
    reload_data()
    return {"status": "reloaded"}
