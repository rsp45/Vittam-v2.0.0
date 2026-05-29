from __future__ import annotations

import importlib
import inspect
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


TEST_MODULES = [
    "tests.test_api",
    "tests.test_audit_log",
    "tests.test_code_safety",
    "tests.test_feature_engine",
    "tests.test_generated_model_runner",
    "tests.test_llm_agent",
    "tests.test_llm_prompt_contract",
    "tests.test_orchestration",
    "tests.test_regime_detector",
    "tests.test_validators",
    "tests.test_sandbox_timeout",
]


def main() -> None:
    passed = 0
    for module_name in TEST_MODULES:
        module = importlib.import_module(module_name)
        for name, function in inspect.getmembers(module, inspect.isfunction):
            if name.startswith("test_"):
                function()
                passed += 1
    print(f"{passed} checks passed")


if __name__ == "__main__":
    main()
