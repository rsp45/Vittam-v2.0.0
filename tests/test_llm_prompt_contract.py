from backend.app.services.llm_agent import ModelGenerationRequest, build_generation_prompt


def test_generation_prompt_discourages_variance_of_volatility() -> None:
    prompt = build_generation_prompt(
        ModelGenerationRequest(
            symbol="BTCUSDT",
            regime="panic",
            confidence=0.98,
            champion_rmse=0.0008,
            challenger_rmse=0.0005,
        )
    )

    assert "do not forecast the standard deviation of volatility values" in prompt.lower()
    assert "beat champion RMSE" in prompt
