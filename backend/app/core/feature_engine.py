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

        # High-level RL Features
        order_book_slope = (tick.ask_size - tick.bid_size) / spread if spread > 0 else 0.0
        micro_price = tick.price
        if total_depth > 0:
            micro_price = (tick.bid * tick.ask_size + tick.ask * tick.bid_size) / total_depth
        micro_price_returns = math.log(micro_price / tick.price) if tick.price > 0 and micro_price > 0 else 0.0

        half_idx = len(returns) // 2
        if half_idx > 0:
            recent_vol = math.sqrt(sum(v * v for v in returns[half_idx:]))
            past_vol = math.sqrt(sum(v * v for v in returns[:half_idx]))
            volatility_clustering = recent_vol / past_vol if past_vol > 0 else 1.0
        else:
            volatility_clustering = 1.0

        return FeatureVector(
            symbol=tick.symbol,
            realized_volatility=realized_volatility,
            order_flow_imbalance=order_flow_imbalance,
            spread=spread,
            vpin_proxy=vpin_proxy,
            order_book_slope=order_book_slope,
            micro_price_returns=micro_price_returns,
            volatility_clustering=volatility_clustering,
            timestamp=tick.timestamp,
        )

    @staticmethod
    def _log_returns(prices: list[float]) -> list[float]:
        returns: list[float] = []
        for previous, current in zip(prices, prices[1:]):
            if previous > 0 and current > 0:
                returns.append(math.log(current / previous))
        return returns
