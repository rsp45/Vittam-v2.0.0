from __future__ import annotations

import asyncio
import json
import logging
import random
from collections import deque
from datetime import datetime, timezone
import websockets

from backend.app.core.feature_engine import FeatureEngine
from backend.app.core.models import MarketTick, FeatureVector, RegimeState
from backend.app.core.regime_detector import RegimeDetector
from backend.app.core.validators import validate_challenger

logger = logging.getLogger("vittam.ingest")

class BinanceIngestWorker:
    def __init__(self, symbol: str = "BTCUSDT", window_size: int = 30) -> None:
        self.symbol = symbol.upper()
        self.feature_engine = FeatureEngine(window_size=window_size)
        self.detector = RegimeDetector(confirmation_windows=3)
        self.running = False
        
        # Thread-safe local history caches
        self.ticks: deque[MarketTick] = deque(maxlen=200)
        self.features: deque[FeatureVector] = deque(maxlen=200)
        self.states: deque[RegimeState] = deque(maxlen=200)
        self.timeline: deque[dict[str, object]] = deque(maxlen=100)
        self.volatility_values: list[float] = []
        
        # Queue for WebSocket listeners
        self.subscribers: set[asyncio.Queue] = set()
        self.event_subscribers: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=100)
        self.subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self.subscribers.discard(q)

    def subscribe_events(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=100)
        self.event_subscribers.add(q)
        return q

    def unsubscribe_events(self, q: asyncio.Queue) -> None:
        self.event_subscribers.discard(q)

    async def broadcast_tick(self, payload: dict[str, object]) -> None:
        for q in list(self.subscribers):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                try:
                    q.get_nowait()
                    q.put_nowait(payload)
                except Exception:
                    pass

    async def broadcast_event(self, event_type: str, data: dict[str, object]) -> None:
        payload = {
            "event": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
        for q in list(self.event_subscribers):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                try:
                    q.get_nowait()
                    q.put_nowait(payload)
                except Exception:
                    pass

    def get_latest_demo_package(self) -> dict[str, object]:
        """Provides compatibility with the old run_demo_pipeline structure."""
        if not self.states:
            # Generate a baseline mock if empty
            tick = MarketTick(self.symbol, 68000.0, 67999.0, 68001.0, 50.0, 50.0, 10.0)
            feat = self.feature_engine.update(tick)
            state = self.detector.evaluate(feat)
            self.ticks.append(tick)
            self.features.append(feat)
            self.states.append(state)
            self.volatility_values.append(feat.realized_volatility)
            self.timeline.append({
                "step": 1,
                "price": tick.price,
                "regime": state.label,
                "confidence": state.confidence,
                "shift_detected": state.shift_detected,
                "realized_volatility": feat.realized_volatility,
                "ofi": feat.order_flow_imbalance,
                "spread": feat.spread,
                "vpin_proxy": feat.vpin_proxy
            })

        vols = list(self.volatility_values)
        if len(vols) < 20:
            # Pad with simple values if history is too short for validation
            vols = [0.01 for _ in range(20 - len(vols))] + vols
            
        validation = validate_challenger(vols[-40:])
        return {
            "latest_state": self.states[-1],
            "shift_count": sum(1 for s in self.states if s.shift_detected),
            "validation": validation,
            "timeline": list(self.timeline),
            "volatility_values": vols
        }

    async def start(self) -> None:
        self.running = True
        asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        self.running = False

    async def _run_loop(self) -> None:
        uri = f"wss://stream.binance.com:9443/ws/{self.symbol.lower()}@ticker"
        logger.info(f"Connecting to Binance WebSocket: {uri}")
        
        while self.running:
            try:
                async with websockets.connect(uri, ping_interval=20, ping_timeout=20) as websocket:
                    logger.info("Binance WebSocket connected!")
                    while self.running:
                        message = await websocket.recv()
                        data = json.loads(message)
                        await self._process_binance_ticker(data)
            except Exception as exc:
                logger.warning(f"Binance WebSocket disconnected or failed ({exc}). Falling back to simulated ticks...")
                await self._run_simulator_fallback()

    async def _process_binance_ticker(self, data: dict[str, object]) -> None:
        try:
            symbol = str(data.get("s", self.symbol))
            price = float(data.get("c", 0.0))
            bid = float(data.get("b", 0.0))
            ask = float(data.get("a", 0.0))
            bid_size = float(data.get("B", 0.0))
            ask_size = float(data.get("A", 0.0))
            volume = float(data.get("Q", 0.0))  # Last trade quantity as proxy for volume delta

            tick = MarketTick(
                symbol=symbol,
                price=price,
                bid=bid,
                ask=ask,
                bid_size=bid_size,
                ask_size=ask_size,
                volume=volume,
                timestamp=datetime.now(timezone.utc)
            )
            await self._update_pipeline(tick)
        except Exception as exc:
            logger.error(f"Error processing Binance ticker: {exc}")

    async def _run_simulator_fallback(self) -> None:
        """Simulate high-fidelity ticks at 2-second intervals while WS is offline."""
        price = 68000.0 if not self.ticks else self.ticks[-1].price
        step = len(self.ticks)
        
        while self.running:
            step += 1
            # Simulate regime shift triggers periodically to keep the demo dynamic
            # First 20 are calm, next 20 are panic (high volatility), etc.
            volatility = 12.0 if (step % 60) < 30 else 95.0
            drift = 4.0 if (step % 60) >= 30 else 0.5
            price = max(100.0, price + random.gauss(drift, volatility))
            spread = 2.0 if (step % 60) < 30 else 18.0
            bid_size = random.uniform(20, 80)
            ask_size = random.uniform(20, 80) if (step % 60) < 30 else random.uniform(5, 35)
            
            tick = MarketTick(
                symbol=self.symbol,
                price=price,
                bid=price - spread / 2,
                ask=price + spread / 2,
                bid_size=bid_size,
                ask_size=ask_size,
                volume=random.uniform(5, 75),
                timestamp=datetime.now(timezone.utc)
            )
            
            await self._update_pipeline(tick)
            await asyncio.sleep(2.0)

    async def _update_pipeline(self, tick: MarketTick) -> None:
        self.ticks.append(tick)
        features = self.feature_engine.update(tick)
        self.features.append(features)
        
        self.volatility_values.append(features.realized_volatility)
        # Limit history memory
        if len(self.volatility_values) > 1000:
            self.volatility_values.pop(0)
            
        state = self.detector.evaluate(features)
        self.states.append(state)
        
        step = len(self.ticks)
        timeline_point = {
            "step": step,
            "price": round(tick.price, 2),
            "regime": state.label,
            "confidence": round(state.confidence, 4),
            "shift_detected": state.shift_detected,
            "realized_volatility": round(features.realized_volatility, 6),
            "ofi": round(features.order_flow_imbalance, 4),
            "spread": round(features.spread, 4),
            "vpin_proxy": round(features.vpin_proxy, 4),
            "timestamp": tick.timestamp.isoformat()
        }
        self.timeline.append(timeline_point)

        # Optional database persistence
        try:
            from backend.app.core.database import save_tick, save_features
            save_tick(
                symbol=tick.symbol,
                price=tick.price,
                bid=tick.bid,
                ask=tick.ask,
                bid_size=tick.bid_size,
                ask_size=tick.ask_size,
                volume=tick.volume
            )
            save_features(
                symbol=features.symbol,
                realized_volatility=features.realized_volatility,
                order_flow_imbalance=features.order_flow_imbalance,
                spread=features.spread,
                vpin_proxy=features.vpin_proxy
            )
        except Exception as db_exc:
            logger.debug(f"Optional database save skipped: {db_exc}")

        # Broadcast live update
        vols = list(self.volatility_values)
        if len(vols) < 20:
            vols = [0.01 for _ in range(20 - len(vols))] + vols
        validation = validate_challenger(vols[-40:])
        
        broadcast_payload = {
            "product": "Vittam V 2.0",
            "symbol": self.symbol,
            "price": round(tick.price, 2),
            "regime": state.label,
            "confidence": round(state.confidence, 4),
            "shift_detected": state.shift_detected,
            "shift_count": sum(1 for s in self.states if s.shift_detected),
            "realized_volatility": round(features.realized_volatility, 6),
            "ofi": round(features.order_flow_imbalance, 4),
            "spread": round(features.spread, 4),
            "vpin_proxy": round(features.vpin_proxy, 4),
            "timeline": list(self.timeline),
            "validation": {
                "model_id": validation.model_id,
                "champion_rmse": validation.champion_rmse,
                "challenger_rmse": validation.challenger_rmse,
                "improvement_ratio": validation.improvement_ratio,
                "passed": validation.passed
            }
        }
        await self.broadcast_tick(broadcast_payload)
        
        # Publish events if triggered
        if state.shift_detected:
            logger.info(f"Regime shift detected to {state.label.upper()}!")
            event_data = {
                "regime": state.label,
                "confidence": state.confidence,
                "price": tick.price
            }
            await self.broadcast_event("REGIME_SHIFT_DETECTED", event_data)
            
            # Optional database and cache publish
            try:
                from backend.app.core.database import save_regime_shift
                from backend.app.core.cache import publish_event
                save_regime_shift(
                    symbol=tick.symbol,
                    regime=state.label,
                    confidence=state.confidence,
                    price=tick.price
                )
                await publish_event("vittam_events", "REGIME_SHIFT_DETECTED", event_data)
            except Exception as ev_exc:
                logger.debug(f"Optional event publish/save skipped: {ev_exc}")
