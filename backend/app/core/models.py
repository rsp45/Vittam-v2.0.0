from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum


class RegimeLabel(StrEnum):
    CALM = "calm"
    TRENDING = "trending"
    PANIC = "panic"


@dataclass(frozen=True)
class MarketTick:
    symbol: str
    price: float
    bid: float
    ask: float
    bid_size: float
    ask_size: float
    volume: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class FeatureVector:
    symbol: str
    realized_volatility: float
    order_flow_imbalance: float
    spread: float
    vpin_proxy: float
    order_book_slope: float = 0.0
    micro_price_returns: float = 0.0
    volatility_clustering: float = 0.0
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class RegimeState:
    label: RegimeLabel
    confidence: float
    shift_detected: bool
    evidence: FeatureVector
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class ForecastPoint:
    symbol: str
    model_id: str
    forecast_value: float
    actual_value: float | None = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class ValidationResult:
    model_id: str
    champion_rmse: float
    challenger_rmse: float
    improvement_ratio: float
    passed: bool
