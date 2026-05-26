# Product Requirements Document (PRD): Dynamic Volatility Regime Modeler (Revamp 2026)

## 1. Executive Summary
Dynamic Volatility Regime Modeler (DVRM) is an agentic volatility forecasting platform that adapts model architecture during market regime shifts. The revamp focuses on hackathon-speed execution with production-conscious guardrails, powered by OpenAI + exchange data + low-latency backend + transparent UI.

## 2. Core Outcome
Build an end-to-end MVP that can:
1. Detect a regime shift from live market microstructure features.
2. Trigger AI-assisted model synthesis.
3. Validate challenger vs champion.
4. Deploy the better model with no stream interruption.
5. Expose explainable decisions in a trader-friendly dashboard.

## 3. Target Users
- Crypto market makers.
- Quant researchers.
- Risk teams needing live volatility adaptation.

## 4. MVP Scope (Hackathon-First)
### In Scope
- Single asset first: `BTCUSDT`.
- Regime classes: `Calm`, `Trending`, `Panic`.
- Feature set: RV, OFI, spread, VPIN proxy.
- Baseline model: GARCH/HAR-RV champion.
- Challenger generation via OpenAI model.
- Backtest windowing + promotion threshold.
- Dashboard: regime status, model comparison, deployment log.

### Out of Scope (Post-MVP)
- Full multi-asset portfolio regime graph.
- RL-based switching policy.
- Full sentiment/news integration.

## 5. Success Metrics
- Forecast quality: >=15% RMSE improvement at regime transition windows.
- Adaptation latency: shift detect to candidate model result <=90s (MVP target).
- Stability: no service crash during synthetic stress replay.
- Explainability: every deployment has reason, prompt lineage, and metrics log.

## 6. Non-Functional Requirements
- Safe code execution sandbox.
- Auditability for generated code decisions.
- Secrets never hardcoded.
- Operational observability from day one.

## 7. Connector Strategy (Required)
- OpenAI Platform MCP.
- GitHub MCP.
- Binance data connector.
- PostgreSQL/TimescaleDB connector.
- Redis connector.
- Object storage connector (S3/R2/MinIO).
- Docker runtime.
- Observability connector.
- Secrets manager connector.
- Alerting connector.

## 8. GitHub Student Pack Leverage
- GitHub Pro + Codespaces for fast onboarding.
- GitHub Copilot for implementation speed.
- DigitalOcean/Azure credits for MVP hosting.
- Sentry/New Relic for error + performance tracking.
- 1Password/Doppler for secure secret flows.

## 9. Demo Narrative
"When volatility regime changes, DVRM detects it, rewrites the forecasting engine using AI, validates performance, and safely swaps to the better model in near real-time."
