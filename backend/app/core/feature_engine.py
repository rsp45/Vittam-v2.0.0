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
        self._prev_ofi: float | None = None

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

        # 1. Realized Bipower Variation (BV)
        realized_bipower_variation = 0.0
        if len(returns) >= 2:
            sum_prod = sum(abs(returns[i]) * abs(returns[i - 1]) for i in range(1, len(returns)))
            realized_bipower_variation = (math.pi / 2.0) * sum_prod

        # 2. Volatility of Volatility (Vol-of-Vol)
        sub_vol_window = 5
        short_vols = []
        for i in range(len(returns) - sub_vol_window + 1):
            sub_returns = returns[i : i + sub_vol_window]
            sv = math.sqrt(sum(v * v for v in sub_returns)) if sub_returns else 0.0
            short_vols.append(sv)
        
        volatility_of_volatility = 0.0
        if len(short_vols) >= 2:
            mean_sv = sum(short_vols) / len(short_vols)
            var_sv = sum((sv - mean_sv) ** 2 for sv in short_vols) / (len(short_vols) - 1)
            volatility_of_volatility = math.sqrt(var_sv)

        # 3. Skewness and Kurtosis
        return_skewness = 0.0
        return_kurtosis = 0.0
        if len(returns) >= 3:
            mean_ret = sum(returns) / len(returns)
            variance = sum((r - mean_ret) ** 2 for r in returns) / len(returns)
            if variance > 1e-12:
                std_dev = math.sqrt(variance)
                m3 = sum((r - mean_ret) ** 3 for r in returns) / len(returns)
                return_skewness = m3 / (std_dev ** 3)
                m4 = sum((r - mean_ret) ** 4 for r in returns) / len(returns)
                return_kurtosis = (m4 / (std_dev ** 4)) - 3.0

        # 4. Depth Imbalance Acceleration
        depth_imbalance_acceleration = 0.0
        if self._prev_ofi is not None:
            depth_imbalance_acceleration = order_flow_imbalance - self._prev_ofi
        self._prev_ofi = order_flow_imbalance

        # 5. Price Momentum
        price_momentum = sum(returns[-5:]) / 5.0 if len(returns) >= 5 else (sum(returns) / len(returns) if returns else 0.0)

        return FeatureVector(
            symbol=tick.symbol,
            realized_volatility=realized_volatility,
            order_flow_imbalance=order_flow_imbalance,
            spread=spread,
            vpin_proxy=vpin_proxy,
            order_book_slope=order_book_slope,
            micro_price_returns=micro_price_returns,
            volatility_clustering=volatility_clustering,
            realized_bipower_variation=realized_bipower_variation,
            volatility_of_volatility=volatility_of_volatility,
            return_skewness=return_skewness,
            return_kurtosis=return_kurtosis,
            depth_imbalance_acceleration=depth_imbalance_acceleration,
            price_momentum=price_momentum,
            timestamp=tick.timestamp,
        )

    @staticmethod
    def _log_returns(prices: list[float]) -> list[float]:
        returns: list[float] = []
        for previous, current in zip(prices, prices[1:]):
            if previous > 0 and current > 0:
                returns.append(math.log(current / previous))
        return returns
