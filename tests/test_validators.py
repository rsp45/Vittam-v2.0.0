from backend.app.core.validators import validate_challenger


def test_challenger_validation_returns_metrics() -> None:
    values = [0.01 for _ in range(20)] + [0.015, 0.017, 0.019, 0.021, 0.024, 0.026, 0.029, 0.031]
    result = validate_challenger(values)

    assert result.model_id == "challenger-stress-weighted"
    assert result.champion_rmse >= 0
    assert result.challenger_rmse >= 0
