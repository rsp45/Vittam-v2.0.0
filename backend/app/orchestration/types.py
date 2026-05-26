from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class TaskContext:
    intent: str
    symbol: str = "BTCUSDT"
    requested_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class AgentResult:
    agent: str
    payload: dict[str, Any]
    completed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class WorkflowTrace:
    workflow_id: str
    intent: str
    agent_plan: list[str]
    results: list[AgentResult]
    memory_keys: list[str]
    completed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
