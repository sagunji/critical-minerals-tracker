"""
Sync script: Downloads CMIF (Critical Minerals Innovation Fund) recipients
from Ontario Data Catalogue via CKAN API and generates funding.json.

Uses the stable dataset slug to dynamically resolve the CSV download URL,
so it won't break if Ontario re-uploads with a new resource UUID.

Source: https://data.ontario.ca/dataset/critical-minerals-innovation-fund-recipients

Usage:
  cd apps/api
  uv run python scripts/sync_cmif.py
"""

import csv
import json
import sys
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

DATASET_SLUG = "critical-minerals-innovation-fund-recipients"
CKAN_API_URL = f"https://data.ontario.ca/api/3/action/package_show?id={DATASET_SLUG}"

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "funding.json"
METADATA_FILE = DATA_DIR / "funding_metadata.json"


def resolve_csv_url() -> tuple[str, dict]:
    """Use CKAN API to find the current English CSV download URL and metadata."""
    req = Request(CKAN_API_URL, headers={"User-Agent": "CriticalMineralsTracker/0.1"})

    try:
        with urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
    except URLError as e:
        print(f"ERROR querying CKAN API: {e}", file=sys.stderr)
        return "", {}

    if not data.get("success"):
        print(f"CKAN API returned failure: {data.get('error')}", file=sys.stderr)
        return "", {}

    result = data["result"]
    resources = result.get("resources", [])

    # Find the English CSV resource
    csv_resource = None
    for r in resources:
        if r.get("format", "").upper() == "CSV" and "fr" not in r.get("url", "").lower():
            csv_resource = r
            break

    if not csv_resource:
        print("ERROR: No English CSV resource found in dataset", file=sys.stderr)
        return "", {}

    metadata = {
        "dataset_slug": DATASET_SLUG,
        "dataset_title": result.get("title", ""),
        "dataset_url": f"https://data.ontario.ca/dataset/{DATASET_SLUG}",
        "resource_id": csv_resource.get("id"),
        "resource_url": csv_resource.get("url"),
        "resource_name": csv_resource.get("name"),
        "resource_last_modified": csv_resource.get("last_modified") or csv_resource.get("created"),
        "resource_size_bytes": csv_resource.get("size"),
        "licence": result.get("license_title", ""),
        "maintainer": result.get("maintainer", ""),
        "maintainer_branch": next(
            (e["value"] for e in result.get("extras", []) if e.get("key") == "Maintainer Branch"),
            None,
        ),
        "date_range": next(
            (e["value"] for e in result.get("extras", []) if e.get("key") == "Date range"),
            None,
        ),
        "update_frequency": next(
            (e["value"] for e in result.get("extras", []) if e.get("key") == "Update frequency"),
            None,
        ),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

    return csv_resource["url"], metadata


def fetch_csv(url: str) -> str:
    """Download CSV content from a URL."""
    req = Request(url, headers={"User-Agent": "CriticalMineralsTracker/0.1"})
    try:
        with urlopen(req, timeout=30) as response:
            return response.read().decode("utf-8-sig")
    except URLError as e:
        print(f"ERROR downloading CSV: {e}", file=sys.stderr)
        return ""


def parse_csv(content: str) -> list[dict]:
    """Parse the CMIF CSV into funding records."""
    if not content:
        return []

    reader = csv.DictReader(StringIO(content))
    records = []

    for row in reader:
        operator = (
            row.get("Company Name")
            or row.get("Organization")
            or row.get("Applicant")
            or ""
        ).strip()

        project_name = (
            row.get("Project Name")
            or row.get("Project Title")
            or row.get("Project")
            or ""
        ).strip()

        amount_str = (
            row.get("Approved Funding Amount ($)")
            or row.get("Funding Amount")
            or row.get("Amount")
            or "0"
        )

        amount = 0.0
        if amount_str:
            amount_str = str(amount_str).replace("$", "").replace(",", "").strip()
            try:
                amount = float(amount_str)
            except ValueError:
                pass

        intake_str = (
            row.get("CMIF Intake")
            or row.get("Intake")
            or row.get("Round")
            or "0"
        )
        try:
            intake = int(intake_str) if intake_str else 0
        except ValueError:
            intake = 0

        if operator:
            records.append({
                "operator": operator,
                "projectName": project_name,
                "amount": amount,
                "program": "Ontario CMIF",
                "intake": intake,
            })

    return records


def main():
    print(f"Syncing CMIF funding data at {datetime.now(timezone.utc).isoformat()}")
    print(f"Dataset: {DATASET_SLUG}")
    print(f"CKAN API: {CKAN_API_URL}")
    print()

    # Step 1: Resolve the current CSV URL via CKAN API
    print("Resolving CSV download URL from CKAN API...")
    csv_url, metadata = resolve_csv_url()

    if csv_url:
        print(f"  Resource: {metadata.get('resource_name')}")
        print(f"  Last modified: {metadata.get('resource_last_modified')}")
        print(f"  URL: {csv_url}")
        print()

        # Step 2: Download the CSV
        content = fetch_csv(csv_url)
    else:
        content = ""

    # Fallback to local copy
    if not content:
        print("Live fetch failed. Checking for local fallback...", file=sys.stderr)
        raw_csv = DATA_DIR / "raw" / "cmif_recipients.csv"
        if raw_csv.exists():
            print(f"Using local fallback: {raw_csv}")
            content = raw_csv.read_text(encoding="utf-8-sig")
            metadata = {
                "dataset_slug": DATASET_SLUG,
                "dataset_url": f"https://data.ontario.ca/dataset/{DATASET_SLUG}",
                "resource_url": "LOCAL FALLBACK",
                "resource_last_modified": None,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "note": "Fetched from local fallback file, not live API",
            }
        else:
            print("No fallback available. Exiting.", file=sys.stderr)
            sys.exit(1)

    # Step 3: Parse
    records = parse_csv(content)
    print(f"Parsed {len(records)} funding records")

    # Step 4: Write funding.json
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(records, f, indent=2)
    print(f"Written: {OUTPUT_FILE.name}")

    # Step 5: Write metadata
    metadata["total_records"] = len(records)
    metadata["total_funding_cad"] = sum(r["amount"] for r in records)
    metadata["unique_organizations"] = len(set(r["operator"] for r in records))
    metadata["intakes"] = sorted(set(r["intake"] for r in records))

    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Written: {METADATA_FILE.name}")

    # Summary
    print()
    print(f"Total funding: ${metadata['total_funding_cad']:,.0f}")
    print(f"Unique organizations: {metadata['unique_organizations']}")
    print(f"Intakes: {metadata['intakes']}")
    print("\nDone.")


if __name__ == "__main__":
    main()
