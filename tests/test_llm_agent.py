import os

from backend.app.services.llm_agent import (
    DEFAULT_OPENROUTER_MODEL,
    ModelGenerationRequest,
    _resolve_max_tokens,
    _resolve_openrouter_model,
    build_generation_prompt,
    generate_model,
)


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
    assert "Do not use randomness" in prompt
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


def test_invalid_openrouter_model_falls_back_to_default() -> None:
    assert _resolve_openrouter_model("openai/GPT-5.5 Pro") == DEFAULT_OPENROUTER_MODEL
    assert _resolve_openrouter_model("openai/gpt-4o-mini") == "openai/gpt-4o-mini"


def test_openrouter_max_tokens_is_capped() -> None:
    original_value = os.environ.get("OPENROUTER_MAX_TOKENS")
    os.environ["OPENROUTER_MAX_TOKENS"] = "65536"
    try:
        assert _resolve_max_tokens() == 2000
    finally:
        if original_value is None:
            os.environ.pop("OPENROUTER_MAX_TOKENS", None)
        else:
            os.environ["OPENROUTER_MAX_TOKENS"] = original_value
