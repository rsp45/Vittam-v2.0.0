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
        # Jump intensity (realized volatility minus bipower variation)
        jump_intensity = max(features.realized_volatility - features.realized_bipower_variation, 0.0)

        stress_score = (
            features.realized_volatility * 90.0
            + jump_intensity * 120.0
            + features.volatility_of_volatility * 150.0
            + max(features.return_kurtosis, 0.0) * 0.08
            + abs(features.return_skewness) * 0.10
            + abs(features.depth_imbalance_acceleration) * 0.35
            + abs(features.price_momentum) * 20.0
            + abs(features.order_flow_imbalance) * 0.35
            + min(features.spread / 10.0, 0.30)
            + features.vpin_proxy * 0.30
            + abs(features.order_book_slope) * 0.20
            + abs(features.micro_price_returns) * 40.0
            + max(features.volatility_clustering - 1.0, 0.0) * 0.40
        )

        if stress_score >= 1.55:
            return RegimeLabel.PANIC, min(0.99, 0.65 + stress_score / 6.0)
        if stress_score >= 0.65:
            return RegimeLabel.TRENDING, min(0.94, 0.60 + stress_score / 7.0)
        return RegimeLabel.CALM, max(0.60, 0.95 - stress_score / 2.5)
