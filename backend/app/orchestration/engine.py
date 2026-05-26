from __future__ import annotations

import uuid

from backend.app.orchestration.audit_log import append_workflow_trace
from backend.app.orchestration.agents import (
    run_market_analyst,
    run_model_builder,
    run_portfolio_governor,
    run_risk_guard,
    run_volatility_researcher,
)
from backend.app.orchestration.memory import SharedMemoryStore
from backend.app.orchestration.router import AgentRouter
from backend.app.orchestration.types import AgentResult, TaskContext, WorkflowTrace


class RufloInspiredOrchestrator:
    """
    Lightweight orchestration engine inspired by Ruflo:
    intent router -> role agents -> shared memory trace.
    """

    def __init__(self) -> None:
        self.router = AgentRouter()
        self.memory = SharedMemoryStore()

    def run(self, intent: str = "full_cycle", symbol: str = "BTCUSDT") -> WorkflowTrace:
        context = TaskContext(intent=intent, symbol=symbol)
        plan = self.router.route(intent)
        results: list[AgentResult] = []

        if "market_analyst" in plan:
            results.append(run_market_analyst(context, self.memory))

        for _ in range(2):
            if "volatility_researcher" in plan:
                results.append(run_volatility_researcher(context, self.memory))
            if "model_builder" in plan:
                results.append(run_model_builder(context, self.memory))
            if "risk_guard" in plan:
                results.append(run_risk_guard(context, self.memory))
            
            risk = self.memory.get("risk.assessment")
            if isinstance(risk, dict) and risk.get("risk_level") != "high":
                break

        if "portfolio_governor" in plan:
            results.append(run_portfolio_governor(context, self.memory))

        trace = WorkflowTrace(
            workflow_id=f"wf-{uuid.uuid4().hex[:10]}",
            intent=intent,
            agent_plan=plan,
            results=results,
            memory_keys=self.memory.keys(),
        )
        append_workflow_trace(trace)
        return trace
