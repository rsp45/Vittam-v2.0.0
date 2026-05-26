from __future__ import annotations

import uuid

from backend.app.orchestration.agents import run_market_analyst, run_model_builder, run_risk_guard
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

        for agent_name in plan:
            if agent_name == "market_analyst":
                results.append(run_market_analyst(context, self.memory))
            elif agent_name == "model_builder":
                results.append(run_model_builder(context, self.memory))
            elif agent_name == "risk_guard":
                results.append(run_risk_guard(context, self.memory))

        return WorkflowTrace(
            workflow_id=f"wf-{uuid.uuid4().hex[:10]}",
            intent=intent,
            agent_plan=plan,
            results=results,
            memory_keys=self.memory.keys(),
        )
