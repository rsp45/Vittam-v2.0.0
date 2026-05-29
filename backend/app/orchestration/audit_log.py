from __future__ import annotations

import json
from pathlib import Path

from backend.app.core.db import get_supabase_client
from backend.app.orchestration.types import WorkflowTrace


AUDIT_LOG_PATH = Path("data") / "workflow_audit.jsonl"


def append_workflow_trace(trace: WorkflowTrace, path: Path = AUDIT_LOG_PATH) -> None:
    serialized = serialize_workflow_trace(trace)
    
    # Try Supabase first
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("workflow_audit").insert({
                "workflow_id": trace.workflow_id,
                "intent": trace.intent,
                "agent_plan": trace.agent_plan,
                "memory_keys": trace.memory_keys,
                "results": serialized["results"],
                "completed_at": serialized["completed_at"]
            }).execute()
        except Exception as e:
            print(f"Failed to insert into Supabase: {e}")
            
    # Always fallback to local file
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as file:
        file.write(json.dumps(serialized, ensure_ascii=True) + "\n")


def read_workflow_history(limit: int = 10, path: Path = AUDIT_LOG_PATH) -> list[dict[str, object]]:
    supabase = get_supabase_client()
    if supabase:
        try:
            response = supabase.table("workflow_audit").select("*").order("completed_at", desc=True).limit(limit).execute()
            if response.data:
                # Need to match local format closely
                return response.data
        except Exception as e:
            print(f"Failed to read from Supabase: {e}")
            
    # Fallback to local file
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
