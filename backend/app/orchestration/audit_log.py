from __future__ import annotations

import json
from pathlib import Path

from backend.app.orchestration.types import WorkflowTrace


AUDIT_LOG_PATH = Path("data") / "workflow_audit.jsonl"


def append_workflow_trace(trace: WorkflowTrace, path: Path = AUDIT_LOG_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as file:
        file.write(json.dumps(serialize_workflow_trace(trace), ensure_ascii=True) + "\n")


def read_workflow_history(limit: int = 10, path: Path = AUDIT_LOG_PATH) -> list[dict[str, object]]:
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    records = [json.loads(line) for line in lines[-limit:] if line.strip()]
    return list(reversed(records))


def serialize_workflow_trace(trace: WorkflowTrace) -> dict[str, object]:
    return {
        "workflow_id": trace.workflow_id,
        "intent": trace.intent,
        "agent_plan": trace.agent_plan,
        "memory_keys": trace.memory_keys,
        "results": [
            {
                "agent": result.agent,
                "payload": result.payload,
                "completed_at": result.completed_at.isoformat(),
            }
            for result in trace.results
        ],
        "completed_at": trace.completed_at.isoformat(),
    }
