from __future__ import annotations

from backend.app.orchestration import RufloInspiredOrchestrator


def test_orchestrator_full_cycle_produces_multi_agent_trace() -> None:
    trace = RufloInspiredOrchestrator().run(intent="full_cycle", symbol="BTCUSDT")
    assert trace.intent == "full_cycle"
    assert trace.agent_plan == ["market_analyst", "model_builder", "risk_guard"]
    assert len(trace.results) == 3
    assert "market.analysis" in trace.memory_keys
    assert "model.candidate" in trace.memory_keys
    assert "risk.assessment" in trace.memory_keys


def test_orchestrator_risk_intent_routes_to_risk_plan() -> None:
    trace = RufloInspiredOrchestrator().run(intent="risk", symbol="BTCUSDT")
    assert trace.agent_plan == ["market_analyst", "risk_guard"]
    assert len(trace.results) == 2
