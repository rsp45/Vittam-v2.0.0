from backend.app.services.code_safety import inspect_generated_model


def test_safe_generated_model_passes() -> None:
    result = inspect_generated_model(
        """
class GeneratedVolatilityModel:
    def fit(self, values: list[float]) -> None:
        self.values = values

    def predict(self, horizon: int) -> list[float]:
        return [0.1 for _ in range(horizon)]
"""
    )

    assert result.passed is True
    assert result.issues == []


def test_generated_model_rejects_imports() -> None:
    result = inspect_generated_model(
        """
import os

class GeneratedVolatilityModel:
    def fit(self, values: list[float]) -> None:
        self.values = values

    def predict(self, horizon: int) -> list[float]:
        return [0.1 for _ in range(horizon)]
"""
    )

    assert result.passed is False
    assert "forbidden syntax: Import" in result.issues
