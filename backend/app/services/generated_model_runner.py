from __future__ import annotations

import math
from dataclasses import dataclass

from backend.app.core.validators import RollingMeanChampion, EWMABaseline, GARCHBaseline, rmse
from backend.app.services.code_safety import inspect_generated_model


SAFE_BUILTINS = {
    "__build_class__": __build_class__,
    "abs": abs,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "object": object,
    "range": range,
    "sum": sum,
}


@dataclass(frozen=True)
class GeneratedModelBenchmark:
    passed: bool
    champion_rmse: float
    generated_rmse: float | None
    improvement_ratio: float
    issues: list[str]


import multiprocessing

def _run_model_in_process(source_code: str, train: list[float], horizon: int, queue: multiprocessing.Queue) -> None:
    try:
        namespace: dict[str, object] = {}
        exec(source_code, {"__builtins__": SAFE_BUILTINS, "__name__": "generated_model"}, namespace)
        model_class = namespace["GeneratedVolatilityModel"]
        model = model_class()
        model.fit(train)
        predictions = model.predict(horizon)
        queue.put((True, [float(value) for value in predictions]))
    except Exception as exc:
        queue.put((False, str(exc)))


def benchmark_generated_model(
    source_code: str,
    values: list[float],
    improvement_threshold: float = 0.15,
) -> GeneratedModelBenchmark:
    safety = inspect_generated_model(source_code)
    if not safety.passed:
        return GeneratedModelBenchmark(
            passed=False,
            champion_rmse=0.0,
            generated_rmse=None,
            improvement_ratio=0.0,
            issues=safety.issues,
        )
    if len(values) < 20:
        return GeneratedModelBenchmark(False, 0.0, None, 0.0, ["at least 20 observations are required"])

    train = values[:-8]
    test = values[-8:]
    champions = [RollingMeanChampion(), EWMABaseline(), GARCHBaseline()]
    best_champion_rmse = float('inf')
    for champ in champions:
        champ.fit(train)
        champ_rmse = rmse(test, champ.predict(len(test)))
        if champ_rmse < best_champion_rmse:
            best_champion_rmse = champ_rmse
            
    champion_rmse = best_champion_rmse

    try:
        queue = multiprocessing.Queue()
        p = multiprocessing.Process(
            target=_run_model_in_process,
            args=(source_code, train, len(test), queue)
        )
        p.start()
        p.join(timeout=2.0)
        
        if p.is_alive():
            p.terminate()
            p.join()
            return GeneratedModelBenchmark(False, champion_rmse, None, 0.0, ["runtime error: sandbox execution timed out after 2.0s"])
            
        success, result_data = queue.get_nowait() if not queue.empty() else (False, "no predictions returned")
        if not success:
            return GeneratedModelBenchmark(False, champion_rmse, None, 0.0, [f"runtime error: {result_data}"])
            
        generated_predictions = result_data
        _assert_predictions(generated_predictions, len(test))
        generated_rmse = rmse(test, generated_predictions)
    except Exception as exc:
        return GeneratedModelBenchmark(False, champion_rmse, None, 0.0, [f"runtime error: {exc}"])

    improvement_ratio = 0.0 if champion_rmse == 0 else (champion_rmse - generated_rmse) / champion_rmse
    return GeneratedModelBenchmark(
        passed=improvement_ratio >= improvement_threshold,
        champion_rmse=champion_rmse,
        generated_rmse=generated_rmse,
        improvement_ratio=improvement_ratio,
        issues=[] if math.isfinite(generated_rmse) else ["generated RMSE is not finite"],
    )


def _assert_predictions(predictions: object, horizon: int) -> None:
    if not isinstance(predictions, list):
        raise TypeError("predict() must return a list")
    if len(predictions) != horizon:
        raise ValueError(f"predict() returned {len(predictions)} values, expected {horizon}")
    for value in predictions:
        if not isinstance(value, int | float):
            raise TypeError("all predictions must be numeric")
        if not math.isfinite(float(value)):
            raise ValueError("predictions must be finite")
        if float(value) < 0:
            raise ValueError("predictions must be non-negative")
