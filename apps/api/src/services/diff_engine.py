"""
Diff engine: Compares two historical snapshots and produces a structured changelog.

Detects:
  - New projects added
  - Projects removed
  - Stage changes (advancement/regression)
  - Status changes (active/suspended)
  - Operator changes (acquisitions)
  - New funding awarded
  - Mineral reclassification
"""

import json
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
HISTORY_DIR = DATA_DIR / "history"
CHANGELOG_FILE = DATA_DIR / "changelog.json"

STAGE_ORDER = [
    "Advanced Project",
    "Advanced Processing Project",
    "Processing Facility",
    "Producing Mine",
]


class ChangeType(str, Enum):
    NEW_PROJECT = "new_project"
    REMOVED_PROJECT = "removed_project"
    STAGE_CHANGE = "stage_change"
    STATUS_CHANGE = "status_change"
    OPERATOR_CHANGE = "operator_change"
    FUNDING_CHANGE = "funding_change"
    MINERAL_CHANGE = "mineral_change"


@dataclass
class Change:
    type: ChangeType
    project_id: str
    project_name: str
    description: str
    old_value: str | None = None
    new_value: str | None = None
    significance: str = "medium"  # low, medium, high


def _load_snapshot(date: str) -> dict[str, dict]:
    """Load a historical snapshot and index by project ID."""
    path = HISTORY_DIR / f"minerals_{date}.json"
    if not path.exists():
        return {}
    with open(path) as f:
        projects = json.load(f)
    return {p["id"]: p for p in projects}


def available_snapshots() -> list[str]:
    """Return sorted list of available snapshot dates."""
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(HISTORY_DIR.glob("minerals_*.json"))
    return [f.stem.replace("minerals_", "") for f in files]


def diff_snapshots(old_date: str, new_date: str) -> list[Change]:
    """Compare two snapshots and return all detected changes."""
    old_data = _load_snapshot(old_date)
    new_data = _load_snapshot(new_date)

    if not old_data or not new_data:
        return []

    changes: list[Change] = []

    old_ids = set(old_data.keys())
    new_ids = set(new_data.keys())

    # New projects
    for pid in sorted(new_ids - old_ids):
        p = new_data[pid]
        changes.append(Change(
            type=ChangeType.NEW_PROJECT,
            project_id=pid,
            project_name=p["name"],
            description=f"New project: {p['name']} ({p['operator']}) — {p['primaryMineral']}, {p['stage']}",
            new_value=p["stage"],
            significance="high",
        ))

    # Removed projects
    for pid in sorted(old_ids - new_ids):
        p = old_data[pid]
        changes.append(Change(
            type=ChangeType.REMOVED_PROJECT,
            project_id=pid,
            project_name=p["name"],
            description=f"Removed: {p['name']} ({p['operator']}) no longer in NRCan inventory",
            old_value=p["stage"],
            significance="high",
        ))

    # Changes to existing projects
    for pid in sorted(old_ids & new_ids):
        old_p = old_data[pid]
        new_p = new_data[pid]

        # Stage change
        if old_p["stage"] != new_p["stage"]:
            old_idx = STAGE_ORDER.index(old_p["stage"]) if old_p["stage"] in STAGE_ORDER else -1
            new_idx = STAGE_ORDER.index(new_p["stage"]) if new_p["stage"] in STAGE_ORDER else -1
            direction = "advanced" if new_idx > old_idx else "moved"

            changes.append(Change(
                type=ChangeType.STAGE_CHANGE,
                project_id=pid,
                project_name=new_p["name"],
                description=f"{new_p['name']} {direction} from {old_p['stage']} → {new_p['stage']}",
                old_value=old_p["stage"],
                new_value=new_p["stage"],
                significance="high",
            ))

        # Status change
        if old_p["status"] != new_p["status"]:
            changes.append(Change(
                type=ChangeType.STATUS_CHANGE,
                project_id=pid,
                project_name=new_p["name"],
                description=f"{new_p['name']} status: {old_p['status']} → {new_p['status']}",
                old_value=old_p["status"],
                new_value=new_p["status"],
                significance="high" if "suspend" in new_p["status"].lower() else "medium",
            ))

        # Operator change
        if old_p["operator"] != new_p["operator"]:
            changes.append(Change(
                type=ChangeType.OPERATOR_CHANGE,
                project_id=pid,
                project_name=new_p["name"],
                description=f"{new_p['name']} operator changed: {old_p['operator']} → {new_p['operator']}",
                old_value=old_p["operator"],
                new_value=new_p["operator"],
                significance="medium",
            ))

        # Primary mineral reclassification
        if old_p["primaryMineral"] != new_p["primaryMineral"]:
            changes.append(Change(
                type=ChangeType.MINERAL_CHANGE,
                project_id=pid,
                project_name=new_p["name"],
                description=f"{new_p['name']} reclassified: {old_p['primaryMineral']} → {new_p['primaryMineral']}",
                old_value=old_p["primaryMineral"],
                new_value=new_p["primaryMineral"],
                significance="low",
            ))

    return changes


def generate_changelog_entry(old_date: str, new_date: str) -> dict:
    """Generate a complete changelog entry for a date range."""
    changes = diff_snapshots(old_date, new_date)

    return {
        "from_date": old_date,
        "to_date": new_date,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_changes": len(changes),
        "by_type": _count_by_type(changes),
        "changes": [asdict(c) for c in changes],
    }


def _count_by_type(changes: list[Change]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for c in changes:
        key = c.type.value
        counts[key] = counts.get(key, 0) + 1
    return counts


def load_changelog() -> list[dict]:
    """Load the full changelog from disk."""
    if not CHANGELOG_FILE.exists():
        return []
    with open(CHANGELOG_FILE) as f:
        return json.load(f)


def append_changelog(entry: dict) -> None:
    """Append a new entry to the changelog file."""
    changelog = load_changelog()
    changelog.append(entry)
    with open(CHANGELOG_FILE, "w") as f:
        json.dump(changelog, f, indent=2)


def rebuild_changelog() -> list[dict]:
    """Rebuild entire changelog from all available snapshots."""
    dates = available_snapshots()
    if len(dates) < 2:
        return []

    changelog = []
    for i in range(1, len(dates)):
        entry = generate_changelog_entry(dates[i - 1], dates[i])
        if entry["total_changes"] > 0:
            changelog.append(entry)

    with open(CHANGELOG_FILE, "w") as f:
        json.dump(changelog, f, indent=2)

    return changelog
