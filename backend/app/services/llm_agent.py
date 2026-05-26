from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass


MODEL_CONTRACT = """class GeneratedVolatilityModel:
    model_id = "generated-openrouter-candidate"

    def fit(self, values: list[float]) -> None:
        self.level = sum(values[-12:]) / max(len(values[-12:]), 1)
        self.slope = 0.0 if len(values) < 2 else (values[-1] - values[- min(len(values), 12)]) / max(min(len(values), 12) - 1, 1)

    def predict(self, horizon: int) -> list[float]:
        return [max(self.level + self.slope * step, 0.0) for step in range(1, horizon + 1)]
"""


@dataclass(frozen=True)
class ModelGenerationRequest:
    symbol: str
    regime: str
    confidence: float
    champion_rmse: float
    challenger_rmse: float


@dataclass(frozen=True)
class ModelGenerationResult:
    provider: str
    model: str
    source_code: str
    rationale: str


def build_generation_prompt(request: ModelGenerationRequest) -> str:
    return f"""
You are generating a Python volatility model for Vittam V 2.0.

Context:
- Symbol: {request.symbol}
- Current regime: {request.regime}
- Regime confidence: {request.confidence:.2%}
- Champion RMSE: {request.champion_rmse:.8f}
- Current challenger RMSE: {request.challenger_rmse:.8f}

Return only a compact Python class named GeneratedVolatilityModel.
Rules:
- No imports.
- No file, network, shell, or environment access.
- Implement fit(self, values: list[float]) -> None.
- Implement predict(self, horizon: int) -> list[float].
- Prediction values must be non-negative floats.
""".strip()


def generate_model(request: ModelGenerationRequest) -> ModelGenerationResult:
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    if provider == "openrouter" and os.getenv("OPENROUTER_API_KEY"):
        return _generate_with_openrouter(request)
    return _generate_mock(request, provider)


def _generate_mock(request: ModelGenerationRequest, provider: str = "mock") -> ModelGenerationResult:
    return ModelGenerationResult(
        provider=provider,
        model="mock-deterministic",
        source_code=MODEL_CONTRACT,
        rationale=f"Mock candidate generated for {request.symbol} during {request.regime} regime.",
    )


def _generate_with_openrouter(request: ModelGenerationRequest) -> ModelGenerationResult:
    api_key = os.environ["OPENROUTER_API_KEY"]
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
    prompt = build_generation_prompt(request)
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You write safe, minimal Python model classes for a sandbox."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    data = json.dumps(payload).encode("utf-8")
    http_request = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Vittam V 2.0",
        },
    )

    try:
        with urllib.request.urlopen(http_request, timeout=30) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        fallback = _generate_mock(request, "openrouter-fallback")
        return ModelGenerationResult(
            provider=fallback.provider,
            model=fallback.model,
            source_code=fallback.source_code,
            rationale=f"OpenRouter call failed, used mock fallback: {exc}",
        )

    content = body["choices"][0]["message"]["content"]
    return ModelGenerationResult(
        provider="openrouter",
        model=model,
        source_code=_strip_code_fence(content),
        rationale=f"OpenRouter generated a candidate for {request.regime} regime.",
    )


def _strip_code_fence(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        return "\n".join(lines).strip()
    return cleaned
