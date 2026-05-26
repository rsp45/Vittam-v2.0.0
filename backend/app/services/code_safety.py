from __future__ import annotations

import ast
from dataclasses import dataclass


FORBIDDEN_NODES = (
    ast.Import,
    ast.ImportFrom,
    ast.With,
    ast.AsyncWith,
    ast.Try,
    ast.Global,
    ast.Nonlocal,
)
FORBIDDEN_CALLS = {"open", "exec", "eval", "compile", "__import__", "input"}
REQUIRED_METHODS = {"fit", "predict"}


@dataclass(frozen=True)
class CodeSafetyResult:
    passed: bool
    issues: list[str]


def inspect_generated_model(source_code: str) -> CodeSafetyResult:
    issues: list[str] = []
    try:
        tree = ast.parse(source_code)
    except SyntaxError as exc:
        return CodeSafetyResult(False, [f"syntax error: {exc.msg}"])

    classes = [node for node in tree.body if isinstance(node, ast.ClassDef)]
    generated_classes = [node for node in classes if node.name == "GeneratedVolatilityModel"]
    if len(generated_classes) != 1:
        issues.append("expected exactly one GeneratedVolatilityModel class")
        return CodeSafetyResult(False, issues)

    methods = {node.name for node in generated_classes[0].body if isinstance(node, ast.FunctionDef)}
    missing_methods = sorted(REQUIRED_METHODS - methods)
    if missing_methods:
        issues.append(f"missing required methods: {', '.join(missing_methods)}")

    for node in ast.walk(tree):
        if isinstance(node, FORBIDDEN_NODES):
            issues.append(f"forbidden syntax: {type(node).__name__}")
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
            issues.append(f"forbidden call: {node.func.id}")
        if isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            issues.append(f"forbidden dunder attribute: {node.attr}")

    return CodeSafetyResult(passed=not issues, issues=sorted(set(issues)))
