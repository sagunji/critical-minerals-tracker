import json
from pathlib import Path
from functools import lru_cache

from ..models.project import MineralProject, FundingRecord

DATA_DIR = Path(__file__).parent.parent / "data"


def _load_funding() -> list[dict]:
    path = DATA_DIR / "funding.json"
    if not path.exists():
        return []
    with open(path) as f:
        return json.load(f)


def _match_funding(project_operator: str, funding_data: list[dict]) -> list[FundingRecord]:
    matched = []
    operator_lower = project_operator.lower()
    first_word = project_operator.split(" ")[0].lower()

    for f in funding_data:
        f_operator = f["operator"].lower()
        if f_operator in operator_lower or first_word in f_operator:
            matched.append(FundingRecord(
                program=f["program"],
                amount=f.get("amount"),
                year=f.get("intake"),
                purpose=f.get("projectName"),
            ))
    return matched


@lru_cache(maxsize=1)
def load_projects() -> list[MineralProject]:
    path = DATA_DIR / "minerals.json"
    if not path.exists():
        return []

    with open(path) as f:
        raw = json.load(f)

    funding_data = _load_funding()

    projects = []
    for record in raw:
        if funding_data:
            funding = _match_funding(record.get("operator", ""), funding_data)
            if funding:
                record["funding"] = [f.model_dump() for f in funding]

        projects.append(MineralProject(**record))

    return projects


def reload_data():
    """Clear caches to force re-read from disk."""
    load_projects.cache_clear()
