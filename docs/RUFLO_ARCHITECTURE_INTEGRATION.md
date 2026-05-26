# Ruflo-Inspired Architecture Integration

This project now includes a lightweight orchestration workflow inspired by `ruvnet/ruflo`.

## Implemented Mapping

- Orchestration layer:
  `backend/app/orchestration/engine.py` runs workflows from intent to completion.
- Router:
  `backend/app/orchestration/router.py` maps intent to agent plan.
- Specialized agents:
  `backend/app/orchestration/agents.py` contains `market_analyst`, `model_builder`, and `risk_guard`.
- Shared memory:
  `backend/app/orchestration/memory.py` persists outputs between agents in a single run.
- API entrypoint:
  `POST /v1/orchestrator/run` in `backend/app/main.py`.

## Workflow

1. User/API submits intent (example: `full_cycle`).
2. Router selects agent sequence.
3. Agents execute and write structured state to shared memory.
4. Workflow trace returns plan, per-agent payloads, and memory keys.

## Local Usage

```powershell
python scripts/run_orchestrator.py
```

Or via API:

```text
POST http://127.0.0.1:8000/v1/orchestrator/run?intent=full_cycle&symbol=BTCUSDT
```

## Why This Approach

`ruflo` is a broad platform (plugin marketplace, federation, 100+ agents, memory backends, MCP-first runtime).  
For this project, we integrated the core workflow pattern that gives immediate value without introducing heavy runtime dependencies:

- Intent routing
- Role-based agents
- Shared memory between agents
- End-to-end workflow traceability
