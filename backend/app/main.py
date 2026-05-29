from __future__ import annotations

import logging
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

import asyncio
from pydantic import BaseModel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import gradio as gr

from backend.app.orchestration import RufloInspiredOrchestrator
from backend.app.orchestration.audit_log import read_workflow_history, serialize_workflow_trace
from backend.app.services.code_safety import inspect_generated_model
from backend.app.legacy_dashboard import demo as legacy_demo
from backend.app.services.generated_model_runner import benchmark_generated_model
from backend.app.services.llm_agent import ModelGenerationRequest, generate_model
from backend.app.services.binance_ingest import BinanceIngestWorker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vittam.api")

# Initialize real-time background worker
ingest_worker = BinanceIngestWorker(symbol="BTCUSDT")
orchestrator = RufloInspiredOrchestrator()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start Binance/Simulator background service
    logger.info("Starting real-time Ingestion Worker background task...")
    await ingest_worker.start()
    yield
    # Stop background service
    logger.info("Stopping real-time Ingestion Worker background task...")
    await ingest_worker.stop()

app = FastAPI(title="Vittam V 2.0", version="0.1.0", lifespan=lifespan)

# Mount legacy Gradio dashboard
app = gr.mount_gradio_app(app, legacy_demo, path="/v1/legacy")

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


@app.get("/v1/capabilities")
def capabilities() -> dict[str, object]:
    return {
        "product": "Vittam V 2.0",
        "routes": [
            "GET /health",
            "GET /v1/capabilities",
            "GET /v1/demo/run",
            "POST /v1/agent/generate-model",
            "POST /v1/orchestrator/run",
            "GET /v1/orchestrator/history",
            "WS /v1/stream/volatility",
            "WS /v1/stream/events"
        ],
        "orchestration": "ruflo-inspired",
        "llm_modes": ["mock", "openrouter"],
    }


@app.get("/v1/demo/run")
def run_demo() -> dict[str, object]:
    # Returns the actual, active live pipeline values in real-time
    result = ingest_worker.get_latest_demo_package()
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
        "champion_forecasts": result.get("champion_forecasts", []),
        "challenger_forecasts": result.get("challenger_forecasts", []),
    }


class CustomModelRequest(BaseModel):
    source_code: str


@app.post("/v1/agent/validate-custom")
async def validate_custom_model(request: CustomModelRequest) -> dict[str, object]:
    source_code = request.source_code
    safety = inspect_generated_model(source_code)
    
    result = ingest_worker.get_latest_demo_package()
    benchmark = benchmark_generated_model(source_code, result["volatility_values"][-40:])
    
    if safety.passed and benchmark.passed:
        ingest_worker.active_challenger_code = source_code
        await ingest_worker.broadcast_event("MODEL_PROMOTED", {
            "model_id": "manual-custom-candidate",
            "improvement_ratio": benchmark.improvement_ratio
        })
    else:
        await ingest_worker.broadcast_event("MODEL_REJECTED", {
            "model_id": "manual-custom-candidate",
            "reason": safety.issues[0] if safety.issues else (benchmark.issues[0] if benchmark.issues else "failed safety or did not beat champion")
        })
        
    return {
        "safety": {
            "passed": safety.passed,
            "issues": safety.issues,
        },
        "benchmark": {
            "passed": benchmark.passed,
            "champion_rmse": benchmark.champion_rmse,
            "generated_rmse": benchmark.generated_rmse,
            "improvement_ratio": benchmark.improvement_ratio,
            "issues": benchmark.issues,
        },
    }


class SymbolSwapRequest(BaseModel):
    symbol: str


@app.post("/v1/ingest/symbol")
async def swap_active_symbol(request: SymbolSwapRequest) -> dict[str, str]:
    await ingest_worker.change_symbol(request.symbol)
    return {"status": "ok", "symbol": ingest_worker.symbol}


class StressShockRequest(BaseModel):
    type: str


@app.post("/v1/demo/stress-shock")
async def inject_stress_shock(request: StressShockRequest) -> dict[str, str]:
    ingest_worker.pending_shock = request.type
    return {"status": "ok", "shock": request.type}


@app.post("/v1/agent/generate-model")
async def generate_agent_model() -> dict[str, object]:
    result = ingest_worker.get_latest_demo_package()
    state = result["latest_state"]
    validation = result["validation"]
    
    # Broadcast event that model generation has started
    await ingest_worker.broadcast_event("MODEL_GENERATION_STARTED", {
        "model_id": "generated-openrouter-candidate",
        "regime": state.label,
        "symbol": state.evidence.symbol
    })
    
    generation = generate_model(
        ModelGenerationRequest(
            symbol=state.evidence.symbol,
            regime=state.label,
            confidence=state.confidence,
            champion_rmse=validation.champion_rmse,
            challenger_rmse=validation.challenger_rmse,
        )
    )
    
    safety = inspect_generated_model(generation.source_code)
    benchmark = benchmark_generated_model(generation.source_code, result["volatility_values"][-40:])
    
    # Broadcast validation results
    await ingest_worker.broadcast_event("MODEL_VALIDATION_RESULT", {
        "safety_passed": safety.passed,
        "benchmark_passed": benchmark.passed,
        "champion_rmse": benchmark.champion_rmse,
        "generated_rmse": benchmark.generated_rmse,
        "improvement_ratio": benchmark.improvement_ratio,
        "issues": safety.issues + benchmark.issues
    })
    
    if safety.passed and benchmark.passed:
        ingest_worker.active_challenger_code = generation.source_code
        await ingest_worker.broadcast_event("MODEL_PROMOTED", {
            "model_id": "generated-openrouter-candidate",
            "improvement_ratio": benchmark.improvement_ratio
        })
    else:
        await ingest_worker.broadcast_event("MODEL_REJECTED", {
            "model_id": "generated-openrouter-candidate",
            "reason": "failed safety or did not beat champion"
        })
        
    return {
        "provider": generation.provider,
        "model": generation.model,
        "rationale": generation.rationale,
        "safety": {
            "passed": safety.passed,
            "issues": safety.issues,
        },
        "benchmark": {
            "passed": benchmark.passed,
            "champion_rmse": benchmark.champion_rmse,
            "generated_rmse": benchmark.generated_rmse,
            "improvement_ratio": benchmark.improvement_ratio,
            "issues": benchmark.issues,
        },
        "source_code": generation.source_code,
    }


@app.post("/v1/orchestrator/run")
async def run_orchestrator(intent: str = "full_cycle", symbol: str = "BTCUSDT") -> dict[str, object]:
    # Broadcast workflow started event
    await ingest_worker.broadcast_event("WORKFLOW_STARTED", {
        "intent": intent,
        "symbol": symbol
    })
    
    trace = orchestrator.run(intent=intent, symbol=symbol)
    
    # Find decision agent result
    decision_payload = {}
    for res in trace.results:
        if res.agent == "portfolio_governor":
            decision_payload = res.payload
            
    # Find and hot-swap candidate source code if consensus approved it
    if decision_payload.get("approved", False):
        for res in trace.results:
            if res.agent == "model_builder":
                code = res.payload.get("source_code")
                if code:
                    ingest_worker.active_challenger_code = code
                    await ingest_worker.broadcast_event("MODEL_PROMOTED", {
                        "model_id": "ruflo-consensus-candidate",
                        "improvement_ratio": res.payload.get("benchmark", {}).get("improvement_ratio", 0.0)
                    })

    # Broadcast workflow completed event
    await ingest_worker.broadcast_event("WORKFLOW_COMPLETED", {
        "workflow_id": trace.workflow_id,
        "decision": decision_payload.get("decision", "unknown"),
        "reason": decision_payload.get("reason", "no decision")
    })
    
    return serialize_workflow_trace(trace)


@app.get("/v1/orchestrator/history")
def orchestrator_history(limit: int = 10) -> dict[str, object]:
    return {"items": read_workflow_history(limit=limit)}


# Live Streaming WebSockets
@app.websocket("/v1/stream/volatility")
async def stream_volatility(websocket: WebSocket) -> None:
    await websocket.accept()
    logger.info("Client connected to volatility stream.")
    q = ingest_worker.subscribe()
    
    # Send the first state immediately so UI loads instantly
    try:
        current_data = ingest_worker.get_latest_demo_package()
        latest_tick = ingest_worker.timeline[-1] if ingest_worker.timeline else {"price": 68000.0}
        initial_payload = {
            "product": "Vittam V 2.0",
            "symbol": ingest_worker.symbol,
            "price": latest_tick.get("price", 68000.0),
            "regime": current_data["latest_state"].label,
            "confidence": current_data["latest_state"].confidence,
            "shift_detected": False,
            "shift_count": current_data["shift_count"],
            "realized_volatility": latest_tick.get("realized_volatility", 0.0),
            "ofi": latest_tick.get("ofi", 0.0),
            "spread": latest_tick.get("spread", 0.0),
            "vpin_proxy": latest_tick.get("vpin_proxy", 0.0),
            "timeline": current_data["timeline"],
            "validation": {
                "model_id": current_data["validation"].model_id,
                "champion_rmse": current_data["validation"].champion_rmse,
                "challenger_rmse": current_data["validation"].challenger_rmse,
                "improvement_ratio": current_data["validation"].improvement_ratio,
                "passed": current_data["validation"].passed,
            }
        }
        await websocket.send_json(initial_payload)
    except Exception as exc:
        logger.error(f"Error sending initial payload: {exc}")
        
    try:
        while True:
            data = await q.get()
            await websocket.send_json(data)
    except WebSocketDisconnect:
        logger.info("Client disconnected from volatility stream.")
    except Exception as exc:
        logger.error(f"Error in volatility stream: {exc}")
    finally:
        ingest_worker.unsubscribe(q)


@app.websocket("/v1/stream/events")
async def stream_events(websocket: WebSocket) -> None:
    await websocket.accept()
    logger.info("Client connected to events stream.")
    q = ingest_worker.subscribe_events()
    try:
        while True:
            event = await q.get()
            await websocket.send_json(event)
    except WebSocketDisconnect:
        logger.info("Client disconnected from events stream.")
    except Exception as exc:
        logger.error(f"Error in events stream: {exc}")
    finally:
        ingest_worker.unsubscribe_events(q)
