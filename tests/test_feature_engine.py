from backend.app.core.feature_engine import FeatureEngine
from backend.app.core.models import MarketTick


def test_feature_engine_outputs_basic_microstructure_features() -> None:
    engine = FeatureEngine(window_size=5)
    feature = None

    for price in [100.0, 101.0, 102.0]:
        feature = engine.update(
            MarketTick(
                symbol="BTCUSDT",
                price=price,
                bid=price - 0.5,
                ask=price + 0.5,
                bid_size=60,
                ask_size=40,
                volume=25,
            )
        )

    assert feature is not None
    assert feature.realized_volatility > 0
    assert feature.order_flow_imbalance == 0.2
    assert feature.spread == 1.0
