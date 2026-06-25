"""
Sync script: Fetches live commodity spot prices from the Rzzro public API
and USD/CAD exchange rate from the Bank of Canada Valet API.

Generates prices.json with current prices in both USD and CAD.

Sources:
  - Rzzro API (CC BY 4.0): https://rzzro.com/api/
  - Bank of Canada Valet API (free, no auth): https://www.bankofcanada.ca/valet/

Metals covered: Nickel, Copper, Zinc, Aluminum, Platinum, Palladium
Not covered (no standard spot price): Lithium, Cobalt, Graphite, Rare Earths, Uranium

Usage:
  cd apps/api
  uv run python scripts/sync_prices.py
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "prices.json"

RZZRO_API_URL = "https://rzzro.com/api/prices.json"
BOC_VALET_URL = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1"

METAL_MAP = {
    "nickel": {
        "display_name": "Nickel",
        "symbol": "NI",
        "tracker_mineral": "Nickel",
    },
    "copper": {
        "display_name": "Copper",
        "symbol": "CU",
        "tracker_mineral": "Copper",
    },
    "zinc": {
        "display_name": "Zinc",
        "symbol": "ZN",
        "tracker_mineral": "Zinc",
    },
    "aluminum": {
        "display_name": "Aluminum",
        "symbol": "AL",
        "tracker_mineral": "Other",
    },
    "lead": {
        "display_name": "Lead",
        "symbol": "PB",
        "tracker_mineral": "Other",
    },
    "tin": {
        "display_name": "Tin",
        "symbol": "SN",
        "tracker_mineral": "Other",
    },
}


def fetch_json(url: str, description: str) -> dict | None:
    """Fetch JSON from a URL with error handling."""
    print(f"  Fetching {description}...")
    req = Request(url, headers={"User-Agent": "CriticalMineralsTracker/1.0"})
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except (URLError, json.JSONDecodeError, TimeoutError) as e:
        print(f"  WARNING: Failed to fetch {description}: {e}")
        return None


def get_usd_cad_rate() -> float | None:
    """Get the latest USD/CAD exchange rate from Bank of Canada."""
    data = fetch_json(BOC_VALET_URL, "Bank of Canada USD/CAD rate")
    if not data:
        return None
    try:
        observations = data.get("observations", [])
        if not observations:
            return None
        latest = observations[-1]
        rate_str = latest.get("FXUSDCAD", {}).get("v")
        if rate_str:
            return float(rate_str)
    except (KeyError, ValueError, IndexError) as e:
        print(f"  WARNING: Could not parse BoC rate: {e}")
    return None


def main():
    print("=" * 60)
    print("COMMODITY PRICE SYNC")
    print("=" * 60)

    usd_cad = get_usd_cad_rate()
    if usd_cad:
        print(f"  USD/CAD rate: {usd_cad:.4f}")
    else:
        print("  WARNING: Could not fetch USD/CAD rate. Using fallback 1.38")
        usd_cad = 1.38

    rzzro_data = fetch_json(RZZRO_API_URL, "Rzzro commodity prices")
    if not rzzro_data:
        print("ERROR: Could not fetch Rzzro prices. Aborting.")
        sys.exit(1)

    commodities = rzzro_data.get("commodities", rzzro_data)
    base_unit = rzzro_data.get("unit", "USD/mt")
    last_updated_rzzro = rzzro_data.get("last_updated", "")

    now = datetime.now(timezone.utc).isoformat()
    prices = {}
    fetched_count = 0

    for rzzro_key, meta in METAL_MAP.items():
        commodity_data = commodities.get(rzzro_key)
        if not commodity_data:
            print(f"  SKIP: {meta['display_name']} not found in Rzzro response")
            continue

        price_usd = commodity_data.get("price")
        if price_usd is None:
            continue

        unit = base_unit
        exchange = commodity_data.get("exchange", "")
        contract = commodity_data.get("contract", "")
        if contract:
            exchange = f"{exchange} {contract}".strip()
        change_pct = commodity_data.get("change_pct", 0)
        timestamp = last_updated_rzzro or now

        is_per_oz = "oz" in unit.lower()
        price_cad = round(price_usd * usd_cad, 2)

        prices[rzzro_key] = {
            "display_name": meta["display_name"],
            "symbol": meta["symbol"],
            "tracker_mineral": meta["tracker_mineral"],
            "price_usd": price_usd,
            "price_cad": price_cad,
            "unit": unit.replace("USD", "CAD") if "USD" in unit else unit,
            "unit_usd": unit,
            "exchange": exchange,
            "change_pct": change_pct,
            "price_timestamp": timestamp,
        }
        fetched_count += 1
        print(f"  {meta['display_name']:12s}  ${price_usd:>10,.2f} {unit}  →  ${price_cad:>10,.2f} CAD  ({change_pct:+.2f}%)")

    not_priced = ["Lithium", "Cobalt", "Graphite", "Rare Earths", "Uranium", "Potash", "Chromite"]
    unpriced = []
    for mineral in not_priced:
        unpriced.append({
            "display_name": mineral,
            "reason": "No standard spot price — traded OTC or via specialized exchanges",
        })

    output = {
        "metadata": {
            "source": "Rzzro API (rzzro.com) — CC BY 4.0",
            "fx_source": "Bank of Canada Valet API",
            "usd_cad_rate": usd_cad,
            "last_updated": now,
            "metals_count": fetched_count,
            "note": "Spot prices from LME/COMEX/NYMEX. Not all critical minerals have standardized spot prices.",
        },
        "prices": prices,
        "unpriced_minerals": unpriced,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n  Wrote {fetched_count} metal prices to {OUTPUT_FILE.name}")
    print("  Done.")


if __name__ == "__main__":
    main()
