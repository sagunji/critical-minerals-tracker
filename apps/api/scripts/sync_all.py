"""
Master sync script: Runs all data sync tasks in sequence.

Usage:
  cd apps/api
  uv run python scripts/sync_all.py
"""

import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent


def run_script(name: str) -> bool:
    """Run a sync script and return True if successful."""
    script = SCRIPTS_DIR / name
    print(f"{'='*60}")
    print(f"Running: {name}")
    print(f"{'='*60}")

    result = subprocess.run(
        [sys.executable, str(script)],
        cwd=str(SCRIPTS_DIR.parent),
    )

    if result.returncode != 0:
        print(f"\nWARNING: {name} exited with code {result.returncode}")
        return False

    print()
    return True


def main():
    scripts = [
        "sync_nrcan.py",
        "sync_cmif.py",
        "sync_prices.py",
    ]

    results = {}
    for script in scripts:
        results[script] = run_script(script)

    print(f"{'='*60}")
    print("SYNC SUMMARY")
    print(f"{'='*60}")
    for script, success in results.items():
        status = "✓" if success else "✗"
        print(f"  {status} {script}")

    if not all(results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
