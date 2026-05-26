from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.orchestration import RufloInspiredOrchestrator
from backend.app.services.simulator import run_demo_pipeline
from backend.app.services.llm_agent import ModelGenerationRequest, generate_model

app = FastAPI(title="Vittam V 2.0", version="0.1.0")
orchestrator = RufloInspiredOrchestrator()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/demo/run")
def run_demo() -> dict[str, object]:
    result = run_demo_pipeline()
    state = result["latest_state"]
    validation = result["validation"]
    return {
        "product": "Vittam V 2.0",
        "symbol": state.evidence.symbol,
        "regime": state.label,
        "confidence": round(state.confidence, 4),
        "shift_count": result["shift_count"],
        "timeline": result["timeline"],
        "validation": {
            "model_id": validation.model_id,
            "champion_rmse": validation.champion_rmse,
            "challenger_rmse": validation.challenger_rmse,
            "improvement_ratio": validation.improvement_ratio,
            "passed": validation.passed,
        },
    }


@app.post("/v1/agent/generate-model")
def generate_agent_model() -> dict[str, object]:
    result = run_demo_pipeline()
    state = result["latest_state"]
    validation = result["validation"]
    generation = generate_model(
        ModelGenerationRequest(
            symbol=state.evidence.symbol,
            regime=state.label,
            confidence=state.confidence,
            champion_rmse=validation.champion_rmse,
            challenger_rmse=validation.challenger_rmse,
        )
    )
    return {
        "provider": generation.provider,
        "model": generation.model,
        "rationale": generation.rationale,
        "source_code": generation.source_code,
    }


@app.post("/v1/orchestrator/run")
def run_orchestrator(intent: str = "full_cycle", symbol: str = "BTCUSDT") -> dict[str, object]:
    trace = orchestrator.run(intent=intent, symbol=symbol)
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
