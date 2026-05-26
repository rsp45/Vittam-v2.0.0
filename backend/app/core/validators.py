from __future__ import annotations

import math
from statistics import mean

import numpy as np

from backend.app.core.models import ValidationResult


class VolatilityModel:
    model_id = "base"

    def fit(self, values: list[float]) -> None:
        raise NotImplementedError

    def predict(self, horizon: int) -> list[float]:
        raise NotImplementedError


class RollingMeanChampion(VolatilityModel):
    model_id = "champion-rolling-mean"

    def __init__(self) -> None:
        self._level = 0.0

    def fit(self, values: list[float]) -> None:
        self._level = mean(values[-10:]) if values else 0.0

    def predict(self, horizon: int) -> list[float]:
        return [self._level for _ in range(horizon)]


class StressWeightedChallenger(VolatilityModel):
    model_id = "challenger-stress-weighted"

    def __init__(self) -> None:
        self._level = 0.0
        self._slope = 0.0

    def fit(self, values: list[float]) -> None:
        if not values:
            return
        recent = values[-10:]
        self._level = mean(recent)
        self._slope = (recent[-1] - recent[0]) / max(len(recent) - 1, 1)

    def predict(self, horizon: int) -> list[float]:
        return [max(self._level + self._slope * step, 0.0) for step in range(1, horizon + 1)]


class EWMABaseline(VolatilityModel):
    model_id = "champion-ewma"

    def __init__(self, alpha: float = 0.94) -> None:
        self.alpha = alpha
        self._level = 0.0

    def fit(self, values: list[float]) -> None:
        if not values:
            self._level = 0.0
            return
        arr = np.array(values)
        weights = (1 - self.alpha) ** np.arange(len(arr) - 1, -1, -1)
        self._level = float(np.average(arr, weights=weights))

    def predict(self, horizon: int) -> list[float]:
        return [self._level for _ in range(horizon)]


class GARCHBaseline(VolatilityModel):
    model_id = "champion-garch"

    def __init__(self) -> None:
        self._level = 0.0

    def fit(self, values: list[float]) -> None:
        if len(values) < 2:
            self._level = float(np.mean(values)) if values else 0.0
            return
        omega = 0.0001
        alpha = 0.1
        beta = 0.85
        
        var = float(np.var(values))
        for v in values:
            var = omega + alpha * (v**2) + beta * var
        self._level = float(np.sqrt(var))

    def predict(self, horizon: int) -> list[float]:
        return [self._level for _ in range(horizon)]


def rmse(actuals: list[float], predictions: list[float]) -> float:
    if len(actuals) != len(predictions):
        raise ValueError("actuals and predictions must have equal length")
    if not actuals:
        return 0.0
    return math.sqrt(mean((actual - prediction) ** 2 for actual, prediction in zip(actuals, predictions)))


def validate_challenger(values: list[float], improvement_threshold: float = 0.15) -> ValidationResult:
    if len(values) < 20:
        raise ValueError("at least 20 observations are required")

    train = values[:-8]
    test = values[-8:]
    
    champions = [RollingMeanChampion(), EWMABaseline(), GARCHBaseline()]
    best_champion_rmse = float('inf')
    best_champion_id = "champion-rolling-mean"
    
    for champ in champions:
        champ.fit(train)
        rmse_val = rmse(test, champ.predict(len(test)))
        if rmse_val < best_champion_rmse:
            best_champion_rmse = rmse_val
            best_champion_id = champ.model_id

    challenger = StressWeightedChallenger()
    challenger.fit(train)

    champion_rmse = best_champion_rmse
    challenger_rmse = rmse(test, challenger.predict(len(test)))
    improvement_ratio = 0.0 if champion_rmse == 0 else (champion_rmse - challenger_rmse) / champion_rmse

    return ValidationResult(
        model_id=challenger.model_id,
        champion_rmse=champion_rmse,
        challenger_rmse=challenger_rmse,
        improvement_ratio=improvement_ratio,
        passed=improvement_ratio >= improvement_threshold,
    )
