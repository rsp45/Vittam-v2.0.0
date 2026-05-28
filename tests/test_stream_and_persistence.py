from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import save_tick, get_recent_ticks, save_features, save_regime_shift
from backend.app.core.cache import publish_event

@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"

def test_optional_persistence_in_memory_fallbacks() -> None:
    # Verify database mock fallback logic works perfectly with no DB active
    save_tick("BTCUSDT", 65000.0, 64990.0, 65010.0, 25.0, 30.0, 15.0)
    ticks = get_recent_ticks(limit=10)
    
    assert len(ticks) >= 1
    assert ticks[-1]["symbol"] == "BTCUSDT"
    assert ticks[-1]["price"] == 65000.0
    assert ticks[-1]["bid"] == 64990.0
    assert ticks[-1]["ask"] == 65010.0
    
    # Verify saving features and regime shifts don't raise any errors
    save_features("BTCUSDT", 0.015, 0.25, 20.0, 0.45)
    save_regime_shift("BTCUSDT", "calm", 0.95, 65000.0)

@pytest.mark.anyio
async def test_optional_cache_publish_no_errors() -> None:
    # Verify event publisher works perfectly under in-memory fallback
    await publish_event("vittam_events", "REGIME_SHIFT_DETECTED", {
        "regime": "panic",
        "confidence": 0.99,
        "price": 65000.0
    })

def test_websocket_volatility_stream() -> None:
    client = TestClient(app)
    # Test WebSocket connection and verification of initial payload structure
    with client.websocket_connect("/v1/stream/volatility") as websocket:
        data = websocket.receive_json()
        assert data["product"] == "Vittam V 2.0"
        assert data["symbol"] == "BTCUSDT"
        assert "regime" in data
        assert "confidence" in data
        assert "timeline" in data
        assert "validation" in data

def test_websocket_events_stream() -> None:
    client = TestClient(app)
    # Test WebSocket connection to the event stream works
    with client.websocket_connect("/v1/stream/events") as websocket:
        # Just verify connection established
        pass
