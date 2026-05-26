# Technical Requirements Document (TRD): Dynamic Volatility Regime Modeler (Revamp 2026)

## 1. Architecture Overview
DVRM is split into five services:
1. `ingest-service`: WebSocket + REST fallback collectors.
2. `regime-service`: feature computation + HMM/shift logic.
3. `agent-service`: OpenAI-driven model generation orchestration.
4. `validation-service`: static checks + walk-forward benchmark.
5. `api-gateway`: FastAPI + WebSocket fanout for UI/integrators.

## 2. Runtime Stack
- Python 3.11, FastAPI, Pydantic v2.
- Redis (stream/event bus + cache).
- PostgreSQL + TimescaleDB (historical store).
- Object storage (model files/artifacts).
- Docker for sandbox execution.
- React + TypeScript frontend.

## 3. Regime Detection
- Features per 5m window: RV, OFI, spread, VPIN proxy.
- Shift trigger rule (MVP): posterior(state_current) < 0.60 for 5 consecutive windows.
- Optional fallback: BOCPD fast-alert channel.

## 4. Agentic Synthesis
- LLM call includes: regime metadata, champion failure summary, constraints, interface contract.
- Output must implement `BaseVolatilityModel.fit()` and `predict()`.
- Generated artifact format:
  - `model.py`
  - `metadata.json`
  - `prompt.txt`

## 5. Validation and Promotion
- Static checks: syntax + lint + banned imports/security check.
- Runtime checks: NaN/Inf, timeout, memory cap.
- Backtesting: walk-forward train/test windows over recent slices.
- Promotion rule: challenger RMSE improves by >=15% over champion.

## 6. API Contract (MVP)
- `POST /v1/regime/evaluate`
- `POST /v1/agent/generate-model`
- `POST /v1/models/validate`
- `POST /v1/models/promote`
- `GET /v1/models/active`
- `WS /v1/stream/volatility`
- `WS /v1/stream/events`

## 7. Security and Governance
- Secrets from vault only.
- Every generation/validation/deploy action audit-logged.
- Sandbox has no outbound internet.
- Model artifacts immutable and versioned.

## 8. Observability
- Metrics: ingest lag, generation latency, validation pass rate, RMSE delta.
- Logs: structured JSON with trace IDs.
- Alerts: regime shift storms, repeated validation failures, stale feed.

## 9. Deployment
- Local: Docker Compose for all services.
- Cloud MVP: DO/Azure student credits with managed DB/Redis where possible.
- CI: GitHub Actions (lint, tests, container build).
