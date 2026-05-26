from backend.app.services.generated_model_runner import benchmark_generated_model


SAFE_SOURCE = """
class GeneratedVolatilityModel:
    def fit(self, values: list[float]) -> None:
        self.level = values[-1] if values else 0.0

    def predict(self, horizon: int) -> list[float]:
        return [max(self.level, 0.0) for _ in range(horizon)]
"""


def test_benchmark_generated_model_scores_safe_source() -> None:
    values = [0.01 for _ in range(20)] + [0.015, 0.017, 0.019, 0.021, 0.024, 0.026, 0.029, 0.031]
    result = benchmark_generated_model(SAFE_SOURCE, values)

    assert result.champion_rmse >= 0
    assert result.generated_rmse is not None
    assert result.issues == []


def test_benchmark_generated_model_rejects_unsafe_source() -> None:
    result = benchmark_generated_model("import os\nclass GeneratedVolatilityModel: pass", [0.01 for _ in range(24)])

    assert result.passed is False
    assert "forbidden syntax: Import" in result.issues
