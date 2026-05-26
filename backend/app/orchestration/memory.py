from __future__ import annotations


class SharedMemoryStore:
    """Minimal shared memory used by orchestrated agents."""

    def __init__(self) -> None:
        self._store: dict[str, object] = {}

    def put(self, key: str, value: object) -> None:
        self._store[key] = value

    def get(self, key: str) -> object | None:
        return self._store.get(key)

    def keys(self) -> list[str]:
        return sorted(self._store.keys())
