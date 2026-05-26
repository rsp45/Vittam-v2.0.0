# Dynamic Volatility Regime Modeler

## One-Liner
DVRM is an AI engineering agent for volatility models: it detects market regime shifts, generates a better forecasting model, validates it, and promotes it with an explainable audit trail.

## Problem
Static volatility models often fail exactly when markets change fastest. During transitions from calm markets to panic, manual quant research and redeployment cycles are too slow for live risk systems.

## Solution
DVRM monitors live market microstructure features, classifies regimes, and triggers an OpenAI-powered model factory when the active model no longer fits the market. The system compares champion vs challenger models before promotion.

## MVP
- Simulated `BTCUSDT` feed.
- Rolling feature engine for realized volatility, spread, order flow imbalance, and VPIN proxy.
- Regime detector for `calm`, `trending`, and `panic`.
- Champion vs challenger validation with RMSE-based promotion.
- FastAPI-ready backend and command-center dashboard shell.

## Why AI
The AI component acts as a model engineer, not just a forecaster. It can synthesize a regime-specific model candidate, explain the reason for change, and preserve prompt/model lineage for review.

## Demo Flow
1. Run the market simulation.
2. Watch the detector move from calm to panic.
3. Validate challenger against champion.
4. Show promotion result and dashboard state.

## Current Verification
```powershell
python scripts/run_simulation.py
python scripts/run_checks.py
```
