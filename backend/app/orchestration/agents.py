from __future__ import annotations

from backend.app.orchestration.memory import SharedMemoryStore
from backend.app.orchestration.types import AgentResult, TaskContext
from backend.app.services.llm_agent import ModelGenerationRequest, generate_model
from backend.app.services.simulator import run_demo_pipeline


def run_market_analyst(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    demo = run_demo_pipeline()
    state = demo["latest_state"]
    validation = demo["validation"]
    analysis = {
        "symbol": context.symbol,
        "regime": state.label,
        "confidence": round(state.confidence, 4),
        "shift_count": demo["shift_count"],
        "champion_rmse": validation.champion_rmse,
        "challenger_rmse": validation.challenger_rmse,
    }
    memory.put("market.analysis", analysis)
    return AgentResult(agent="market_analyst", payload=analysis)


def run_model_builder(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    analysis = memory.get("market.analysis")
    if not isinstance(analysis, dict):
        analyst_result = run_market_analyst(context, memory)
        analysis = analyst_result.payload

    generation = generate_model(
        ModelGenerationRequest(
            symbol=str(analysis["symbol"]),
            regime=str(analysis["regime"]),
            confidence=float(analysis["confidence"]),
            champion_rmse=float(analysis["champion_rmse"]),
            challenger_rmse=float(analysis["challenger_rmse"]),
        )
    )
    payload = {
        "provider": generation.provider,
        "model": generation.model,
        "rationale": generation.rationale,
        "source_code": generation.source_code,
    }
    memory.put("model.candidate", payload)
    return AgentResult(agent="model_builder", payload=payload)


def run_risk_guard(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    analysis = memory.get("market.analysis")
    if not isinstance(analysis, dict):
        analyst_result = run_market_analyst(context, memory)
        analysis = analyst_result.payload

    confidence = float(analysis["confidence"])
    shift_count = int(analysis["shift_count"])
    risk_score = min(1.0, round((shift_count / 20.0) + (1.0 - confidence), 4))
    payload = {
        "risk_score": risk_score,
        "risk_level": "high" if risk_score >= 0.75 else "medium" if risk_score >= 0.4 else "low",
        "recommendation": "reduce leverage" if risk_score >= 0.75 else "keep baseline hedges",
    }
    memory.put("risk.assessment", payload)
    return AgentResult(agent="risk_guard", payload=payload)
