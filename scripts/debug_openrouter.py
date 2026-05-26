from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.services.llm_agent import ModelGenerationRequest, generate_model


def main() -> None:
    if not os.getenv("OPENROUTER_API_KEY"):
        print("OPENROUTER_API_KEY is not set in this PowerShell session.")
        return

    os.environ["LLM_PROVIDER"] = "openrouter"
    result = generate_model(
        ModelGenerationRequest(
            symbol="BTCUSDT",
            regime="panic",
            confidence=0.9892,
            champion_rmse=0.000853,
            challenger_rmse=0.000533,
        )
    )
    print(f"provider: {result.provider}")
    print(f"model: {result.model}")
    print(f"rationale: {result.rationale}")
    print("source preview:")
    print(result.source_code[:500])


if __name__ == "__main__":
    main()
