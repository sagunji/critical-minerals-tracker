import json
import re
from pathlib import Path
from functools import lru_cache

from ..models.project import MineralProject, FundingRecord

DATA_DIR = Path(__file__).parent.parent / "data"

_CORP_SUFFIXES = re.compile(
    r"\b(inc|incorporated|corp|corporation|ltd|limited|pty|llc|co|company|s\.?a\.?)\b\.?",
    re.IGNORECASE,
)


def _normalize_operator(name: str) -> str:
    """Strip corporate suffixes and noise to get a canonical company identity."""
    name = name.lower().strip()
    name = _CORP_SUFFIXES.sub("", name)
    name = re.sub(r"[.,\-()']", " ", name)
    return " ".join(name.split())


def _operator_matches(project_operator: str, funding_operator: str) -> bool:
    """
    Determine if a funding record belongs to the same entity as a project operator.
    Uses normalized name comparison with token-overlap scoring.
    """
    norm_project = _normalize_operator(project_operator)
    norm_funding = _normalize_operator(funding_operator)

    if not norm_project or not norm_funding:
        return False

    if norm_project == norm_funding:
        return True

    if norm_project in norm_funding or norm_funding in norm_project:
        return True

    project_tokens = set(norm_project.split())
    funding_tokens = set(norm_funding.split())

    # Discard extremely common words that cause false positives
    noise = {"canada", "canadian", "ontario", "northern", "metals", "mining", "resources", "mineral", "minerals"}
    project_significant = project_tokens - noise
    funding_significant = funding_tokens - noise

    if not project_significant or not funding_significant:
        return False

    overlap = project_significant & funding_significant
    smaller = min(len(project_significant), len(funding_significant))

    return len(overlap) >= max(2, smaller * 0.6)


def _load_funding() -> list[dict]:
    path = DATA_DIR / "funding.json"
    if not path.exists():
        return []
    with open(path) as f:
        return json.load(f)


def _match_funding(project_operator: str, funding_data: list[dict]) -> list[FundingRecord]:
    matched = []
    for f in funding_data:
        if _operator_matches(project_operator, f["operator"]):
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
