# Implementation Plan: Dynamic Volatility Regime Modeler (Revamp 2026)

## 1. Build Strategy
Two-track plan:
- Track A: Hackathon MVP in 48 hours.
- Track B: 4-week hardening path.

## 2. 48-Hour MVP Execution

### Hour 0-4: Platform Setup
- Connect MCPs: OpenAI, GitHub, Binance, Postgres/Timescale, Redis.
- Create repo and service skeleton.
- Wire secrets manager and local `.env` fallback for dev only.

### Hour 4-12: Data + Regime Core
- Implement Binance ingest worker.
- Implement feature engine (RV, OFI, spread, VPIN proxy).
- Implement HMM regime classifier and shift trigger.

### Hour 12-24: Agent + Validation
- Create generation prompt contract + parser.
- Build Docker sandbox runner.
- Implement benchmark flow and promotion rule.

### Hour 24-36: API + UI
- Build FastAPI endpoints + WebSocket channels.
- Build dashboard modules: regime state, model lab, forecast monitor.

### Hour 36-48: Reliability + Demo
- Add observability and alerting.
- Run replay stress scenario.
- Record demo flow and finalize submission assets.

## 3. 4-Week Hardening Path

### Week 1
- Stabilize ingestion and data integrity checks.

### Week 2
- Expand model library and improve generation constraints.

### Week 3
- Improve validation rigor and deployment safeguards.

### Week 4
- Scale infra, add CI/CD quality gates, tighten security policy.

## 4. Connector Setup Order (Exact)
1. OpenAI Platform MCP.
2. GitHub MCP.
3. Binance connector.
4. PostgreSQL/Timescale connector.
5. Redis connector.
6. Object storage.
7. Docker runtime.
8. Secrets manager.
9. Observability.
10. Alerting.

## 5. GitHub Student Pack Utilization Plan
- Codespaces for collaborator onboarding.
- Copilot for rapid scaffolding/tests.
- DO/Azure credits for hosted MVP.
- Sentry/New Relic for monitoring.
- 1Password/Doppler for secrets.

## 6. Definition of Done (MVP)
- Live stream + regime detection active.
- At least one successful challenger generation and validation.
- At least one logged model promotion.
- Dashboard reflects live state/events.
- End-to-end demo reproducible in under 5 minutes setup.
