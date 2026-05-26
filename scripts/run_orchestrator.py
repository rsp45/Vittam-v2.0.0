from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.orchestration import RufloInspiredOrchestrator


def main() -> None:
    trace = RufloInspiredOrchestrator().run(intent="full_cycle", symbol="BTCUSDT")
    output = {
        "workflow_id": trace.workflow_id,
        "intent": trace.intent,
        "agent_plan": trace.agent_plan,
        "memory_keys": trace.memory_keys,
        "results": [{"agent": result.agent, "payload": result.payload} for result in trace.results],
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
