# External Repo Reuse Assessment

## Goal
Identify which referenced open-source projects can improve Vittam V 2.0 without derailing the hackathon MVP.

## Recommended Priority

### 1. TauricResearch/TradingAgents
Use as the main architecture inspiration for RuFlo orchestration.

Useful ideas:
- Specialized financial agent roles.
- Analyst -> researcher/debate -> trader/risk-manager workflow.
- Persistent decision logs and checkpoint-style recovery.
- Multi-provider LLM configuration.

How Vittam should adapt it:
- Keep our existing RuFlo-inspired engine.
- Add domain agents: `technical_volatility_analyst`, `model_builder`, `risk_guard`, `portfolio_governor`.
- Add a persistent run log for every model generation and benchmark.

Do not copy wholesale for MVP:
- Full LangGraph dependency and stock-analysis workflow are heavier than our volatility-modeling scope.

### 2. brokermr810/QuantDinger
Use as product/infrastructure inspiration.

Useful ideas:
- Self-hosted quant operating-system framing.
- Closed-loop quant workflow: idea -> strategy -> backtest -> execute -> monitor.
- Docker-first deployment posture.
- Backtesting/live execution product surface.

How Vittam should adapt it:
- Present Vittam as a focused adaptive-volatility engine, not a general trading terminal.
- Improve dashboard language around the closed loop: detect -> generate -> validate -> promote -> monitor.
- Keep Docker Compose clean and demo-friendly.

### 3. ZhuLinsen/daily_stock_analysis
Use for reporting and notification patterns.

Useful ideas:
- Scheduled AI decision reports.
- Multi-channel push notifications.
- GitHub Actions as a low-cost scheduled automation path.
- News/search enrichment as a later feature.

How Vittam should adapt it:
- Add a daily/weekly "Volatility Regime Report" export.
- Add Discord/Slack alert hooks for regime shifts and model promotions.

### 4. K-Dense-AI/scientific-agent-skills
Use selectively for agent skill design, not as a dependency.

Useful ideas:
- Skill packaging pattern.
- Time-series/model-evaluation skill references.
- Scientific workflow documentation style.

How Vittam should adapt it:
- Create a local `skills/vittam-volatility-modeling/SKILL.md` later.
- Use it to document how agents should generate safe volatility models.

### 5. HKUDS/AI-Trader
Use later for agent-native platform concepts.

Useful ideas:
- Agent registration/onboarding via skill docs.
- Signal sharing and paper-trading community mechanics.
- Agent-facing API documentation.

How Vittam should adapt it:
- Post-MVP, expose a "publish model signal" endpoint or paper-trading integration.
- Avoid adding copy-trading/live execution to the hackathon MVP.

## Immediate Implementation Decision
For the next build step, we should borrow the TradingAgents-style role structure into RuFlo:

`market_analyst -> volatility_researcher -> model_builder -> risk_guard -> portfolio_governor`

This strengthens the hackathon story while staying inside our current codebase.

## License Notes
- TradingAgents: Apache-2.0.
- QuantDinger: Apache-2.0.
- daily_stock_analysis: MIT.
- scientific-agent-skills: MIT.
- AI-Trader: MIT.

Keep attribution if directly copying code. For MVP, prefer conceptual adaptation over vendoring external code.
