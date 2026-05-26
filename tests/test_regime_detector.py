from backend.app.core.models import FeatureVector, RegimeLabel
from backend.app.core.regime_detector import RegimeDetector


def test_regime_detector_promotes_confirmed_shift() -> None:
    detector = RegimeDetector(confirmation_windows=2)
    calm = FeatureVector("BTCUSDT", 0.001, 0.01, 1.0, 0.01)
    panic = FeatureVector("BTCUSDT", 0.02, 0.9, 20.0, 0.9)

    assert detector.evaluate(calm).label == RegimeLabel.CALM
    first = detector.evaluate(panic)
    second = detector.evaluate(panic)

    assert first.shift_detected is False
    assert second.shift_detected is True
    assert second.label == RegimeLabel.PANIC
