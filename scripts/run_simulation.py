from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.services.simulator import run_demo_pipeline


def main() -> None:
    result = run_demo_pipeline()
    state = result["latest_state"]
    validation = result["validation"]

    print("DVRM demo pipeline")
    print(f"Latest regime: {state.label} ({state.confidence:.2%})")
    print(f"Regime shifts detected: {result['shift_count']}")
    print(f"Champion RMSE: {validation.champion_rmse:.6f}")
    print(f"Challenger RMSE: {validation.challenger_rmse:.6f}")
    print(f"Improvement: {validation.improvement_ratio:.2%}")
    print(f"Promotion passed: {validation.passed}")


if __name__ == "__main__":
    main()
