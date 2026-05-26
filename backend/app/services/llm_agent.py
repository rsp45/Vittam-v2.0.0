from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from dataclasses import dataclass

from backend.app.services.code_safety import CodeSafetyResult, inspect_generated_model
from backend.app.services.generated_model_runner import GeneratedModelBenchmark, benchmark_generated_model


MODEL_CONTRACT = """class GeneratedVolatilityModel:
    model_id = "generated-openrouter-candidate"

    def fit(self, values: list[float]) -> None:
        self.level = sum(values[-12:]) / max(len(values[-12:]), 1)
        self.slope = 0.0 if len(values) < 2 else (values[-1] - values[- min(len(values), 12)]) / max(min(len(values), 12) - 1, 1)

    def predict(self, horizon: int) -> list[float]:
        return [max(self.level + self.slope * step, 0.0) for step in range(1, horizon + 1)]
"""
DEFAULT_OPENROUTER_MODEL = "qwen/qwen3-coder-next"
DEFAULT_OPENAI_MODEL = "gpt-4o"
DEFAULT_OPENROUTER_MAX_TOKENS = 900


@dataclass(frozen=True)
class ModelGenerationRequest:
    symbol: str
    regime: str
    confidence: float
    champion_rmse: float
    challenger_rmse: float
    researcher_hypothesis: str | None = None


@dataclass(frozen=True)
class ModelGenerationResult:
    provider: str
    model: str
    source_code: str
    rationale: str


def build_generation_prompt(request: ModelGenerationRequest) -> str:
    hypothesis_section = ""
    if request.researcher_hypothesis:
        hypothesis_section = f"- Researcher Guidance: {request.researcher_hypothesis}\n"

    return f"""
You are generating a Python volatility model for Vittam V 2.0.

Context:
- Symbol: {request.symbol}
- Current regime: {request.regime}
- Regime confidence: {request.confidence:.2%}
- Champion RMSE: {request.champion_rmse:.8f}
- Current challenger RMSE: {request.challenger_rmse:.8f}
{hypothesis_section}- Promotion target: beat champion RMSE by at least 15%.

Instructions:
1. First, formulate a scientific hypothesis about the active regime. Explain the mathematical lineage (e.g., fractional Brownian motion, HAR-RV, GARCH) you are using and why it fits this regime.
2. Then, provide the Python code inside a ```python ``` block.

Rules for the Python code:
- Return only a compact Python class named GeneratedVolatilityModel.
- No imports.
- Do not use import statements anywhere, including inside methods.
- Do not use randomness, time, file access, network access, shell access, or environment access.
- Implement fit(self, values: list[float]) -> None.
- Implement predict(self, horizon: int) -> list[float].
- Prediction values must be non-negative floats.
- Predictions must be deterministic for the same fitted values.
- Use recent volatility levels directly; do not forecast the standard deviation of volatility values.
- Prefer short-horizon continuation/trend logic over global variance estimates.
""".strip()


def generate_model(request: ModelGenerationRequest) -> ModelGenerationResult:
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    if provider == "openai" and os.getenv("OPENAI_API_KEY"):
        return _generate_with_openai(request)
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
    configured_model = os.getenv("OPENROUTER_MODEL", DEFAULT_OPENROUTER_MODEL)
    model = _resolve_openrouter_model(configured_model)
    prompt = build_generation_prompt(request)
    payload = _build_openrouter_payload(model, prompt)
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Vittam V 2.0",
    }
    url = "https://openrouter.ai/api/v1/chat/completions"
    return _execute_llm_pipeline(request, api_key, url, headers, payload, model, "openrouter")


def _generate_with_openai(request: ModelGenerationRequest) -> ModelGenerationResult:
    api_key = os.environ["OPENAI_API_KEY"]
    model = os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
    prompt = build_generation_prompt(request)
    payload = _build_openrouter_payload(model, prompt)
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    url = "https://api.openai.com/v1/chat/completions"
    return _execute_llm_pipeline(request, api_key, url, headers, payload, model, "openai")


def _execute_llm_pipeline(
    request: ModelGenerationRequest, 
    api_key: str, 
    url: str, 
    headers: dict, 
    payload: dict, 
    model: str,
    provider: str
) -> ModelGenerationResult:
    body = _post_llm_api(url, headers, payload, model)
    if isinstance(body, ModelGenerationResult):
        return body

    content = body["choices"][0]["message"]["content"]
    source_code, hypothesis = _extract_code_and_hypothesis(content)
    safety = inspect_generated_model(source_code)
    
    if not safety.passed:
        repaired = _repair_with_llm(api_key, url, headers, model, source_code, safety)
        if repaired is not None:
            source_code = repaired
            safety = inspect_generated_model(source_code)
            
    if safety.passed:
        benchmark = benchmark_generated_model(source_code, _benchmark_context_values())
        if not benchmark.passed:
            repaired_for_performance = _repair_performance_with_llm(api_key, url, headers, model, source_code, benchmark)
            if repaired_for_performance is not None:
                repaired_safety = inspect_generated_model(repaired_for_performance)
                if repaired_safety.passed:
                    source_code = repaired_for_performance
                    safety = repaired_safety

    final_rationale = f"{hypothesis}\n\n[Safety Check]: {_generation_rationale(request.regime, safety)}"

    return ModelGenerationResult(
        provider=provider,
        model=model,
        source_code=source_code,
        rationale=final_rationale.strip(),
    )


def _build_openrouter_payload(model: str, prompt: str) -> dict[str, object]:
    return {
        "model": model,
        "messages": [
            {"role": "system", "content": "You write safe, minimal Python model classes for a sandbox."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": _resolve_max_tokens(),
    }


def _post_llm_api(url: str, headers: dict, payload: dict, model: str) -> dict | ModelGenerationResult:
    data = json.dumps(payload).encode("utf-8")
    http_request = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers=headers,
    )

    try:
        with urllib.request.urlopen(http_request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        fallback = _generate_mock(ModelGenerationRequest("BTCUSDT", "unknown", 0.0, 0.0, 0.0), "api-fallback")
        return ModelGenerationResult(
            provider=fallback.provider,
            model=fallback.model,
            source_code=fallback.source_code,
            rationale=f"LLM API HTTP {exc.code} using {model}: {_compact_error_body(error_body)}",
        )
    except urllib.error.URLError as exc:
        fallback = _generate_mock(ModelGenerationRequest("BTCUSDT", "unknown", 0.0, 0.0, 0.0), "api-fallback")
        return ModelGenerationResult(
            provider=fallback.provider,
            model=fallback.model,
            source_code=fallback.source_code,
            rationale=f"LLM API call failed, used mock fallback: {exc}",
        )


def _repair_with_llm(
    api_key: str,
    url: str,
    headers: dict,
    model: str,
    source_code: str,
    safety: CodeSafetyResult,
) -> str | None:
    repair_prompt = f"""
Rewrite this Python class so it passes the safety policy.

Safety issues:
{chr(10).join(f"- {issue}" for issue in safety.issues)}

Rules:
- Return only class GeneratedVolatilityModel.
- No imports anywhere.
- No randomness.
- No file, network, shell, time, or environment access.
- Keep fit(values) and predict(horizon).
- Predictions must be deterministic, finite, numeric, and non-negative.

Unsafe source:
{source_code}
""".strip()
    body = _post_llm_api(url, headers, _build_openrouter_payload(model, repair_prompt), model)
    if isinstance(body, ModelGenerationResult):
        return None
    content = body["choices"][0]["message"]["content"]
    return _extract_code_and_hypothesis(content)[0]


def _repair_performance_with_llm(
    api_key: str,
    url: str,
    headers: dict,
    model: str,
    source_code: str,
    benchmark: GeneratedModelBenchmark,
) -> str | None:
    repair_prompt = f"""
Rewrite this safe Python class to improve short-horizon volatility RMSE.

Benchmark result:
- Champion RMSE: {benchmark.champion_rmse:.8f}
- Generated RMSE: {benchmark.generated_rmse if benchmark.generated_rmse is not None else "none"}
- Improvement ratio: {benchmark.improvement_ratio:.2%}

Rules:
- Return only class GeneratedVolatilityModel.
- No imports anywhere.
- No randomness.
- Use fit(values) and predict(horizon).
- Predictions must be deterministic, finite, numeric, and non-negative.
- The input values are already realized volatility values. Do not compute their standard deviation as the forecast.
- Favor recent level plus recent slope from the last 8-12 observations.

Underperforming source:
{source_code}
""".strip()
    body = _post_llm_api(url, headers, _build_openrouter_payload(model, repair_prompt), model)
    if isinstance(body, ModelGenerationResult):
        return None
    content = body["choices"][0]["message"]["content"]
    return _extract_code_and_hypothesis(content)[0]


def _benchmark_context_values() -> list[float]:
    baseline = [0.01 for _ in range(24)]
    transition = [0.012, 0.014, 0.017, 0.02, 0.024, 0.029, 0.033, 0.037]
    return baseline + transition


def _generation_rationale(regime: str, safety: CodeSafetyResult) -> str:
    if safety.passed:
        return f"OpenRouter generated a safety-compliant candidate for {regime} regime."
    return f"OpenRouter generated a candidate for {regime} regime, but safety issues remain: {', '.join(safety.issues)}"


def _resolve_openrouter_model(model: str) -> str:
    candidate = model.strip()
    if not candidate or " " in candidate or candidate != candidate.lower() or "/" not in candidate:
        return DEFAULT_OPENROUTER_MODEL
    return candidate


def _resolve_max_tokens() -> int:
    raw_value = os.getenv("OPENROUTER_MAX_TOKENS", str(DEFAULT_OPENROUTER_MAX_TOKENS)).strip()
    try:
        value = int(raw_value)
    except ValueError:
        return DEFAULT_OPENROUTER_MAX_TOKENS
    return min(max(value, 128), 2000)


def _extract_code_and_hypothesis(content: str) -> tuple[str, str]:
    match = re.search(r"```(?:python)?\s*(.*?)```", content, re.DOTALL)
    if match:
        source_code = match.group(1).strip()
        hypothesis = content[:match.start()].strip()
        if not hypothesis:
            hypothesis = "No hypothesis provided."
        return source_code, hypothesis
    
    cleaned = content.strip()
    if cleaned.startswith("class "):
        return cleaned, "No hypothesis provided."
        
    return cleaned, "No hypothesis provided."


def _compact_error_body(body: str) -> str:
    if not body:
        return "empty error body"
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        return body[:700]
    return json.dumps(parsed, ensure_ascii=True)[:700]
