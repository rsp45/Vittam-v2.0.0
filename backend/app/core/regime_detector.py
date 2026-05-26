from __future__ import annotations

from collections import deque

from backend.app.core.models import FeatureVector, RegimeLabel, RegimeState


class RegimeDetector:
    def __init__(self, confidence_threshold: float = 0.60, confirmation_windows: int = 5) -> None:
        self.confidence_threshold = confidence_threshold
        self.confirmation_windows = confirmation_windows
        self._low_confidence_run: deque[bool] = deque(maxlen=confirmation_windows)
        self._active_label: RegimeLabel | None = None

    def evaluate(self, features: FeatureVector) -> RegimeState:
        label, confidence = self._classify(features)
        is_low_confidence_change = self._active_label is not None and label != self._active_label and confidence >= self.confidence_threshold
        self._low_confidence_run.append(is_low_confidence_change)

        shift_detected = len(self._low_confidence_run) == self.confirmation_windows and all(self._low_confidence_run)
        if self._active_label is None or shift_detected:
            self._active_label = label
            self._low_confidence_run.clear()

        return RegimeState(
            label=label,
            confidence=confidence,
            shift_detected=shift_detected,
            evidence=features,
            timestamp=features.timestamp,
        )

    def _classify(self, features: FeatureVector) -> tuple[RegimeLabel, float]:
        stress_score = (
            features.realized_volatility * 120.0
            + abs(features.order_flow_imbalance) * 0.45
            + min(features.spread / 10.0, 0.35)
            + features.vpin_proxy * 0.40
            + abs(features.order_book_slope) * 0.25
            + abs(features.micro_price_returns) * 50.0
            + max(features.volatility_clustering - 1.0, 0.0) * 0.50
        )

        if stress_score >= 1.35:
            return RegimeLabel.PANIC, min(0.99, 0.64 + stress_score / 5.0)
        if stress_score >= 0.55:
            return RegimeLabel.TRENDING, min(0.94, 0.62 + stress_score / 6.0)
        return RegimeLabel.CALM, max(0.60, 0.92 - stress_score / 3.0)
