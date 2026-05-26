from __future__ import annotations

import random
from collections.abc import Iterator

from backend.app.core.feature_engine import FeatureEngine
from backend.app.core.models import MarketTick, RegimeState
from backend.app.core.regime_detector import RegimeDetector
from backend.app.core.validators import validate_challenger


def generate_ticks(symbol: str = "BTCUSDT", count: int = 90, seed: int = 7) -> Iterator[MarketTick]:
    random.seed(seed)
    price = 68_000.0

    for index in range(count):
        volatility = 12.0 if index < 45 else 95.0
        drift = 4.0 if index >= 45 else 0.5
        price = max(100.0, price + random.gauss(drift, volatility))
        spread = 2.0 if index < 45 else 18.0
        bid_size = random.uniform(20, 80)
        ask_size = random.uniform(20, 80) if index < 45 else random.uniform(5, 35)
        yield MarketTick(
            symbol=symbol,
            price=price,
            bid=price - spread / 2,
            ask=price + spread / 2,
            bid_size=bid_size,
            ask_size=ask_size,
            volume=random.uniform(5, 75),
        )


def run_demo_pipeline() -> dict[str, object]:
    feature_engine = FeatureEngine(window_size=30)
    detector = RegimeDetector(confirmation_windows=3)
    states: list[RegimeState] = []
    volatility_values: list[float] = []
    timeline: list[dict[str, object]] = []

    for index, tick in enumerate(generate_ticks()):
        features = feature_engine.update(tick)
        volatility_values.append(features.realized_volatility)
        state = detector.evaluate(features)
        states.append(state)
        timeline.append(
            {
                "step": index + 1,
                "price": round(tick.price, 2),
                "regime": state.label,
                "confidence": round(state.confidence, 4),
                "shift_detected": state.shift_detected,
                "realized_volatility": round(features.realized_volatility, 6),
                "ofi": round(features.order_flow_imbalance, 4),
                "spread": round(features.spread, 4),
                "vpin_proxy": round(features.vpin_proxy, 4),
            }
        )

    validation = validate_challenger(volatility_values[-40:])
    return {
        "latest_state": states[-1],
        "shift_count": sum(1 for state in states if state.shift_detected),
        "validation": validation,
        "timeline": timeline,
        "volatility_values": volatility_values,
    }
