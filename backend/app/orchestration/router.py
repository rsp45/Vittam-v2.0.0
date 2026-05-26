from __future__ import annotations


class AgentRouter:
    """Routes a user intent to a role-based agent execution plan."""

    def route(self, intent: str) -> list[str]:
        intent_normalized = intent.lower().strip()
        if "model" in intent_normalized:
            return ["market_analyst", "volatility_researcher", "model_builder"]
        if "risk" in intent_normalized:
            return ["market_analyst", "risk_guard", "portfolio_governor"]
        return [
            "market_analyst",
            "volatility_researcher",
            "model_builder",
            "risk_guard",
            "portfolio_governor",
        ]
