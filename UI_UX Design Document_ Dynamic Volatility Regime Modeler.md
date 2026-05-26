# UI/UX Design Document: Dynamic Volatility Regime Modeler (Revamp 2026)

## 1. Design Direction
A high-signal control room for fast risk decisions. UI must prioritize explainability of autonomous model changes and confidence under stress.

## 2. Information Architecture
1. Command Center (default landing).
2. Model Lab (generation + diff + validation).
3. Forecast Monitor (live charts and residuals).
4. Ops Console (health, alerts, connector status).

## 3. Core Views
### Command Center
- Regime state banner.
- Volatility temperature gauge.
- Regime timeline with shift markers.
- Alert rail (stale feed, failed validation, promotion events).

### Model Lab
- Prompt lineage panel.
- Code diff (champion vs challenger).
- Validation scorecard (RMSE/MAE/DM + pass/fail).
- Action bar (`Promote`, `Reject`, `Lock`).

### Forecast Monitor
- Champion vs challenger forecast lines.
- Residual histogram.
- Error-over-time chart around shifts.

### Ops Console
- Connector status cards.
- Ingest lag and API latency.
- Recent failures with trace IDs.

## 4. Visual Tokens
- Background: deep slate.
- Stability: cyan.
- AI activity: violet.
- Warning: amber.
- Critical: crimson.
- Font: JetBrains Mono (data/code), Inter (labels/text).

## 5. Responsive Behavior
- Desktop-first for multi-panel usage.
- Tablet support with stacked panel presets.
- Mobile mode limited to alerts + top KPIs.

## 6. Accessibility
- Keyboard-first workflow.
- High contrast option.
- All alerts with visual + text representation.

## 7. Demo UX Flow
1. Detect shift.
2. Open evidence panel.
3. Watch model synthesis progress.
4. Inspect validation card.
5. Promote or auto-promote.
6. Observe post-deploy forecast stabilization.
