from pathlib import Path

from backend.app.orchestration.audit_log import append_workflow_trace, read_workflow_history
from backend.app.orchestration.types import AgentResult, WorkflowTrace


def test_workflow_audit_log_round_trip() -> None:
    path = Path("data") / "test" / "audit-test.jsonl"
    trace = WorkflowTrace(
        workflow_id="wf-test",
        intent="full_cycle",
        agent_plan=["market_analyst"],
        results=[AgentResult(agent="market_analyst", payload={"regime": "panic"})],
        memory_keys=["market.analysis"],
    )

    try:
        append_workflow_trace(trace, path=path)
        history = read_workflow_history(path=path)

        assert len(history) == 1
        assert history[0]["workflow_id"] == "wf-test"
        assert history[0]["results"][0]["agent"] == "market_analyst"
    finally:
        path.unlink(missing_ok=True)
