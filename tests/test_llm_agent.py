import os

from backend.app.services.llm_agent import ModelGenerationRequest, build_generation_prompt, generate_model


def test_prompt_contains_contract() -> None:
    prompt = build_generation_prompt(
        ModelGenerationRequest(
            symbol="BTCUSDT",
            regime="panic",
            confidence=0.91,
            champion_rmse=0.004,
            challenger_rmse=0.003,
        )
    )

    assert "GeneratedVolatilityModel" in prompt
    assert "No imports" in prompt
    assert "BTCUSDT" in prompt


def test_mock_generation_returns_model_source() -> None:
    original_provider = os.environ.get("LLM_PROVIDER")
    original_key = os.environ.get("OPENROUTER_API_KEY")
    os.environ.pop("OPENROUTER_API_KEY", None)
    os.environ["LLM_PROVIDER"] = "mock"

    try:
        result = generate_model(
            ModelGenerationRequest(
                symbol="BTCUSDT",
                regime="panic",
                confidence=0.91,
                champion_rmse=0.004,
                challenger_rmse=0.003,
            )
        )
    finally:
        if original_provider is None:
            os.environ.pop("LLM_PROVIDER", None)
        else:
            os.environ["LLM_PROVIDER"] = original_provider
        if original_key is not None:
            os.environ["OPENROUTER_API_KEY"] = original_key

    assert result.provider == "mock"
    assert "class GeneratedVolatilityModel" in result.source_code
