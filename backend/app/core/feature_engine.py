from __future__ import annotations

import math
from collections import deque

from backend.app.core.models import FeatureVector, MarketTick


class FeatureEngine:
    def __init__(self, window_size: int = 30) -> None:
        if window_size < 3:
            raise ValueError("window_size must be at least 3")
        self.window_size = window_size
        self._ticks: deque[MarketTick] = deque(maxlen=window_size)

    def update(self, tick: MarketTick) -> FeatureVector:
        self._ticks.append(tick)
        prices = [item.price for item in self._ticks]
        returns = self._log_returns(prices)

        realized_volatility = math.sqrt(sum(value * value for value in returns)) if returns else 0.0
        spread = max(tick.ask - tick.bid, 0.0)
        total_depth = tick.bid_size + tick.ask_size
        order_flow_imbalance = 0.0 if total_depth == 0 else (tick.bid_size - tick.ask_size) / total_depth
        vpin_proxy = min(abs(order_flow_imbalance) * max(tick.volume, 1.0) / 100.0, 1.0)

        return FeatureVector(
            symbol=tick.symbol,
            realized_volatility=realized_volatility,
            order_flow_imbalance=order_flow_imbalance,
            spread=spread,
            vpin_proxy=vpin_proxy,
            timestamp=tick.timestamp,
        )

    @staticmethod
    def _log_returns(prices: list[float]) -> list[float]:
        returns: list[float] = []
        for previous, current in zip(prices, prices[1:]):
            if previous > 0 and current > 0:
                returns.append(math.log(current / previous))
        return returns
