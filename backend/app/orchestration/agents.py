from __future__ import annotations

from backend.app.orchestration.memory import SharedMemoryStore
from backend.app.orchestration.types import AgentResult, TaskContext
from backend.app.services.code_safety import inspect_generated_model
from backend.app.services.generated_model_runner import benchmark_generated_model
from backend.app.services.llm_agent import ModelGenerationRequest, generate_model
from backend.app.services.simulator import run_demo_pipeline


def run_market_analyst(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    demo = run_demo_pipeline()
    state = demo["latest_state"]
    validation = demo["validation"]
    features = state.evidence
    analysis = {
        "symbol": context.symbol,
        "regime": state.label,
        "confidence": round(state.confidence, 4),
        "shift_count": demo["shift_count"],
        "champion_rmse": validation.champion_rmse,
        "challenger_rmse": validation.challenger_rmse,
        "features": {
            "realized_volatility": round(features.realized_volatility, 6),
            "realized_bipower_variation": round(features.realized_bipower_variation, 6),
            "volatility_of_volatility": round(features.volatility_of_volatility, 6),
            "return_skewness": round(features.return_skewness, 4),
            "return_kurtosis": round(features.return_kurtosis, 4),
            "depth_imbalance_acceleration": round(features.depth_imbalance_acceleration, 4),
            "price_momentum": round(features.price_momentum, 6),
            "order_flow_imbalance": round(features.order_flow_imbalance, 4),
            "spread": round(features.spread, 4),
            "vpin_proxy": round(features.vpin_proxy, 4),
        }
    }
    memory.put("market.analysis", analysis)
    return AgentResult(agent="market_analyst", payload=analysis)


def run_volatility_researcher(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    analysis = memory.get("market.analysis")
    if not isinstance(analysis, dict):
        analysis = run_market_analyst(context, memory).payload

    risk = memory.get("risk.assessment")
    hypothesis = "panic regime favors recent-level and slope-aware volatility continuation"
    if isinstance(risk, dict) and risk.get("risk_level") == "high":
        hypothesis = "risk is too high, previous candidate failed. generate a highly conservative, mean-reverting model."

    champion_rmse = float(analysis["champion_rmse"])
    challenger_rmse = float(analysis["challenger_rmse"])
    rmse_gap = 0.0 if champion_rmse == 0 else (champion_rmse - challenger_rmse) / champion_rmse
    payload = {
        "regime": analysis["regime"],
        "hypothesis": hypothesis,
        "rmse_gap": rmse_gap,
        "recommended_model_shape": "deterministic recent-level plus short-horizon slope",
        "constraints": [
            "no imports",
            "no randomness",
            "non-negative finite forecasts",
            "beat champion RMSE by 15%",
        ],
    }
    memory.put("research.volatility", payload)
    return AgentResult(agent="volatility_researcher", payload=payload)


def run_model_builder(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    demo = run_demo_pipeline()
    analysis = memory.get("market.analysis")
    if not isinstance(analysis, dict):
        analyst_result = run_market_analyst(context, memory)
        analysis = analyst_result.payload

    research = memory.get("research.volatility")
    researcher_hypothesis = research.get("hypothesis") if isinstance(research, dict) else None

    generation = generate_model(
        ModelGenerationRequest(
            symbol=str(analysis["symbol"]),
            regime=str(analysis["regime"]),
            confidence=float(analysis["confidence"]),
            champion_rmse=float(analysis["champion_rmse"]),
            challenger_rmse=float(analysis["challenger_rmse"]),
            features=analysis.get("features"),
            researcher_hypothesis=researcher_hypothesis,
        )
    )
    payload = {
        "provider": generation.provider,
        "model": generation.model,
        "rationale": generation.rationale,
        "source_code": generation.source_code,
    }
    safety = inspect_generated_model(generation.source_code)
    benchmark = benchmark_generated_model(generation.source_code, demo["volatility_values"][-40:])
    payload["safety"] = {"passed": safety.passed, "issues": safety.issues}
    payload["benchmark"] = {
        "passed": benchmark.passed,
        "champion_rmse": benchmark.champion_rmse,
        "generated_rmse": benchmark.generated_rmse,
        "improvement_ratio": benchmark.improvement_ratio,
        "issues": benchmark.issues,
    }
    memory.put("model.candidate", payload)
    return AgentResult(agent="model_builder", payload=payload)


def run_risk_guard(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    analysis = memory.get("market.analysis")
    candidate = memory.get("model.candidate")
    if not isinstance(analysis, dict):
        analyst_result = run_market_analyst(context, memory)
        analysis = analyst_result.payload

    confidence = float(analysis["confidence"])
    shift_count = int(analysis["shift_count"])
    risk_score = min(1.0, round((shift_count / 20.0) + (1.0 - confidence), 4))
    
    if isinstance(candidate, dict):
        benchmark = candidate.get("benchmark", {})
        if not benchmark.get("passed", False):
            risk_score = min(1.0, risk_score + 0.3)
            
    payload = {
        "risk_score": risk_score,
        "risk_level": "high" if risk_score >= 0.75 else "medium" if risk_score >= 0.4 else "low",
        "recommendation": "reduce leverage" if risk_score >= 0.75 else "keep baseline hedges",
    }
    memory.put("risk.assessment", payload)
    return AgentResult(agent="risk_guard", payload=payload)


def run_portfolio_governor(context: TaskContext, memory: SharedMemoryStore) -> AgentResult:
    candidate = memory.get("model.candidate")
    risk = memory.get("risk.assessment")
    analysis = memory.get("market.analysis")
    if not isinstance(analysis, dict):
        analysis = {}
    if not isinstance(candidate, dict):
        candidate = run_model_builder(context, memory).payload
    if not isinstance(risk, dict):
        risk = run_risk_guard(context, memory).payload

    safety = candidate.get("safety", {})
    benchmark = candidate.get("benchmark", {})
    safety_passed = bool(safety.get("passed"))
    benchmark_passed = bool(benchmark.get("passed"))
    risk_level = str(risk.get("risk_level", "unknown"))
    approved = safety_passed and benchmark_passed and risk_level != "high"
    
    briefing = None
    if approved:
        model_name = candidate.get("model", "synthesized model")
        rmse_val = benchmark.get("generated_rmse", 0.0)
        imp_ratio = benchmark.get("improvement_ratio", 0.0)
        confidence = float(analysis.get("confidence", 0.0))
        shift_count = int(analysis.get("shift_count", 0))
        regime = str(analysis.get("regime", "UNKNOWN")).upper()
        
        briefing = f"""🚨 REGIME SHIFT REPORT: {regime} 🚨

1. Technical Causes:
The active regime shifted due to elevated stress indicators. The core engine observed a {shift_count}-tick sustained deviation with {confidence:.1%} confidence.

2. Challenger Model Performance:
A new '{model_name}' model was synthesized via the AI workflow and tested against industry baselines (GARCH, EWMA). It achieved an RMSE of {rmse_val:.6f}, outperforming the current champion by {imp_ratio:.2%}.

3. Governor Decision:
{_portfolio_decision_reason(safety_passed, benchmark_passed, risk_level)}. The Challenger is deployed into the active trading pool immediately.
"""

    payload = {
        "decision": "promote" if approved else "reject",
        "reason": _portfolio_decision_reason(safety_passed, benchmark_passed, risk_level),
        "deployment_mode": "semi_auto",
        "approved": approved,
        "briefing": briefing,
    }
    memory.put("portfolio.decision", payload)
    return AgentResult(agent="portfolio_governor", payload=payload)


def _portfolio_decision_reason(safety_passed: bool, benchmark_passed: bool, risk_level: str) -> str:
    if not safety_passed:
        return "candidate failed generated-code safety policy"
    if not benchmark_passed:
        return "candidate did not beat champion benchmark"
    if risk_level == "high":
        return "risk guard blocked promotion"
    return "candidate passed safety, benchmark, and risk review"
