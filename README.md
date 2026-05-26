# Dynamic Volatility Regime Modeler

Agentic volatility forecasting MVP for the OpenAI x Outskill AI Builders Hackathon.

## What This Build Does First
- Simulates live `BTCUSDT` market ticks.
- Computes rolling volatility features.
- Detects regime shifts across `calm`, `trending`, and `panic`.
- Runs a champion vs challenger validation loop.
- Exposes a FastAPI-ready backend shape and a static dashboard shell.

## Local Quickstart
```powershell
python scripts/run_simulation.py
python scripts/run_checks.py
python scripts/run_orchestrator.py
```

For the API server after installing dependencies:
```powershell
pip install -r backend/requirements.txt
python scripts/run_api.py
```

To use OpenRouter for agentic model generation, set these in the same PowerShell window before starting the API:
```powershell
$env:LLM_PROVIDER="openrouter"
$env:OPENROUTER_API_KEY="your_openrouter_key"
$env:OPENROUTER_MODEL="openai/gpt-4o-mini"
python scripts/run_api.py
```

Agent endpoint:
```text
POST http://127.0.0.1:8000/v1/agent/generate-model
```

Ruflo-inspired orchestration endpoint:
```text
POST http://127.0.0.1:8000/v1/orchestrator/run?intent=full_cycle&symbol=BTCUSDT
```

After dependencies are installed, the same checks can also run with:
```powershell
python -m pytest
```

Open the dashboard after the API server is running:
```powershell
start frontend/index.html
```

## Hackathon Milestones
- May 26: runnable core pipeline.
- May 28: product brief + MVP demo.
- May 30: go-live version.

## Connector Priority
1. OpenAI Platform MCP
2. GitHub MCP
3. Binance data feed
4. PostgreSQL/TimescaleDB
5. Redis
6. Object storage
7. Docker sandbox
8. Secrets manager
9. Observability
10. Alerting
