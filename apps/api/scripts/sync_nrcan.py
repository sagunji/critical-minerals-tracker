"""
Sync script: Fetches critical minerals project data from NRCan ArcGIS REST API
and generates minerals.json (the source of truth for the API).

NRCan API Layers:
  0 = Advanced exploration projects
  1 = Processing projects (proposed)
  2 = Mines and other primary producing sites
  3 = Processing facilities (active)

Usage:
  cd apps/api
  uv run python scripts/sync_nrcan.py
"""

import json
import hashlib
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

BASE_URL = "https://maps-cartes.services.geo.ca/server_serveur/rest/services/NRCan/critical_minerals_en/MapServer"

LAYERS = {
    0: "Advanced Project",
    1: "Advanced Processing Project",
    2: "Producing Mine",
    3: "Processing Facility",
}

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
RAW_DIR = DATA_DIR / "raw"
HISTORY_DIR = DATA_DIR / "history"
OUTPUT_FILE = DATA_DIR / "minerals.json"
SYNC_LOG_FILE = DATA_DIR / "sync_log.json"


def fetch_layer(layer_id: int) -> list[dict]:
    """Fetch all Ontario records from a single NRCan MapServer layer."""
    url = (
        f"{BASE_URL}/{layer_id}/query?"
        f"where=ProvincesEN+LIKE+'%25Ontario%25'"
        f"&outFields=*"
        f"&returnGeometry=true"
        f"&outSR=4326"
        f"&f=json"
    )

    req = Request(url, headers={"User-Agent": "CriticalMineralsTracker/0.1"})
    try:
        with urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
    except URLError as e:
        print(f"  ERROR fetching layer {layer_id}: {e}", file=sys.stderr)
        return []

    features = data.get("features", [])
    print(f"  Layer {layer_id} ({LAYERS[layer_id]}): {len(features)} records")
    return features


def slugify(name: str) -> str:
    """Create a URL-friendly slug from a project name."""
    slug = name.lower().strip()
    slug = slug.replace("'", "").replace("'", "")
    replacements = [(" - ", "-"), (" ", "-"), ("(", ""), (")", ""), (",", ""), (".", "")]
    for old, new in replacements:
        slug = slug.replace(old, new)
    slug = "-".join(part for part in slug.split("-") if part)
    return slug


def determine_region(lat: float, lng: float) -> str:
    """Rough region classification based on coordinates."""
    if lat > 51:
        return "Far North"
    if -82.5 < lng < -80.0 and 46.0 < lat < 47.2:
        return "Sudbury Basin"
    if -82.0 < lng < -80.5 and 47.5 < lat < 49.5:
        return "Timmins Mining Camp"
    if lng < -85:
        return "Northwestern Ontario"
    if lng > -78:
        return "Eastern Ontario"
    return "North-Central Ontario"


def parse_minerals(commodities_str: str) -> tuple[str, list[str]]:
    """Parse the CommoditiesEN field into primary mineral and list."""
    if not commodities_str:
        return "Other", ["Other"]

    minerals = [m.strip() for m in commodities_str.split(",")]
    minerals = [m for m in minerals if m]

    primary_map = {
        "nickel": "Nickel",
        "lithium": "Lithium",
        "copper": "Copper",
        "cobalt": "Cobalt",
        "graphite": "Graphite",
        "platinum": "Platinum",
        "palladium": "Palladium",
        "chromite": "Chromite",
        "rare earth": "Rare Earths",
    }

    primary = "Other"
    for keyword, label in primary_map.items():
        if any(keyword in m.lower() for m in minerals):
            primary = label
            break

    return primary, minerals


def transform_feature(feature: dict, stage: str) -> dict:
    """Transform a raw NRCan feature into our project schema."""
    attrs = feature["attributes"]
    geom = feature.get("geometry", {})

    name = (attrs.get("PropertyNameEN") or "Unknown").strip()
    operator = (attrs.get("OperatorOwnersEN") or "Unknown").strip()
    operator = operator.replace("\xa0", " ").strip()

    lat = attrs.get("Latitude") or geom.get("y") or 0
    lng = attrs.get("Longitude") or geom.get("x") or 0

    commodities = attrs.get("CommoditiesEN") or ""
    primary_mineral, minerals = parse_minerals(commodities)

    status = (attrs.get("ActivityStatusEN") or "Unknown").strip()
    website = attrs.get("Website") or None
    object_id = attrs.get("OBJECTID")

    operation_group = (attrs.get("OperationGroupEN") or "").strip() or None
    development_stage = (attrs.get("DevelopmentStageEN") or "").strip() or None
    ciar = (attrs.get("CIAR") or "").strip()
    impact_assessment_url = ciar if ciar and ciar != "N/A" else None

    project = {
        "id": slugify(name),
        "name": name,
        "operator": operator,
        "minerals": minerals,
        "primaryMineral": primary_mineral,
        "stage": stage,
        "status": status,
        "latitude": round(lat, 6),
        "longitude": round(lng, 6),
        "region": determine_region(lat, lng),
        "province": "Ontario",
        "website": website,
        "source": f"NRCan Critical Minerals Inventory (OBJECTID: {object_id})",
        "nrcanObjectId": object_id,
    }

    if operation_group:
        project["operationGroup"] = operation_group
    if development_stage:
        project["developmentStage"] = development_stage
    if impact_assessment_url:
        project["impactAssessmentUrl"] = impact_assessment_url

    return project


def deduplicate(projects: list[dict]) -> list[dict]:
    """Remove duplicates based on name + operator."""
    seen = set()
    unique = []
    for p in projects:
        key = (p["name"].lower(), p["operator"].lower())
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique


def compute_hash(projects: list[dict]) -> str:
    """Compute a content hash of the projects for change detection."""
    content = json.dumps(projects, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()[:12]


def main():
    print(f"Syncing NRCan data at {datetime.now(timezone.utc).isoformat()}")
    print(f"API: {BASE_URL}")
    print()

    all_projects = []

    for layer_id, stage in LAYERS.items():
        features = fetch_layer(layer_id)
        for feat in features:
            project = transform_feature(feat, stage)
            all_projects.append(project)

    all_projects = deduplicate(all_projects)
    all_projects.sort(key=lambda p: p["name"])

    print(f"\nTotal unique Ontario projects: {len(all_projects)}")

    # Check for changes
    content_hash = compute_hash(all_projects)
    log_path = SYNC_LOG_FILE
    prev_hash = None
    if log_path.exists():
        with open(log_path) as f:
            log = json.load(f)
            prev_hash = log.get("last_hash")

    changed = prev_hash != content_hash
    if not changed:
        print("No changes detected since last sync.")
    else:
        print(f"Changes detected (hash: {content_hash})")

    # Write current output (always, so enriched fields are picked up)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_projects, f, indent=2)
    print(f"Written: {OUTPUT_FILE.name} ({len(all_projects)} projects)")

    # Archive historical snapshot (irreplaceable time-series data)
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    history_path = HISTORY_DIR / f"minerals_{timestamp}.json"
    with open(history_path, "w") as f:
        json.dump(all_projects, f, indent=2)
    print(f"Historical archive: {history_path.name}")

    # Save raw API response snapshot
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    raw_path = RAW_DIR / f"nrcan_sync_{timestamp}.json"
    with open(raw_path, "w") as f:
        json.dump(all_projects, f, indent=2)
    print(f"Raw snapshot: {raw_path.name}")

    # Count by stage/mineral for metadata
    from collections import Counter
    stage_counts = dict(Counter(p["stage"] for p in all_projects))
    mineral_counts = dict(Counter(p["primaryMineral"] for p in all_projects))

    # Build history index from archived files
    history_files = sorted(HISTORY_DIR.glob("minerals_*.json"))
    history_entries = []
    for hf in history_files:
        date_str = hf.stem.replace("minerals_", "")
        history_entries.append(date_str)

    # Update sync log with full metadata
    with open(log_path, "w") as f:
        json.dump({
            "last_sync": datetime.now(timezone.utc).isoformat(),
            "last_hash": content_hash,
            "data_changed": changed,
            "total_projects": len(all_projects),
            "source_api": BASE_URL,
            "source_name": "Natural Resources Canada — Critical Minerals Projects Database",
            "source_url": "https://open.canada.ca/data/en/dataset/22b2db8a-dc12-47f2-9737-99d3da921751",
            "licence": "Open Government Licence — Canada",
            "query_filter": "ProvincesEN LIKE '%Ontario%'",
            "layers_queried": {str(k): v for k, v in LAYERS.items()},
            "by_stage": stage_counts,
            "by_mineral": mineral_counts,
            "history_snapshots": history_entries,
            "total_snapshots": len(history_entries),
        }, f, indent=2)

    print("\nDone.")


if __name__ == "__main__":
    main()
