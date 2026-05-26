from __future__ import annotations

import logging
import os
import json
import asyncio

logger = logging.getLogger("vittam.cache")

HAS_REDIS = False
redis_client = None

try:
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        import redis
        # Standard synchronous/thread-safe redis client for simple events
        redis_client = redis.from_url(redis_url, socket_timeout=3, socket_connect_timeout=3)
        redis_client.ping()
        HAS_REDIS = True
        logger.info("Successfully connected to Redis event bus!")
except Exception as exc:
    logger.warning(f"Redis connection failed or package missing ({exc}). Using in-memory event channels.")
    HAS_REDIS = False

async def publish_event(channel: str, event_type: str, data: dict[str, object]) -> None:
    payload = {
        "event": event_type,
        "data": data,
        "timestamp": os.getenv("CURRENT_TIME", "") or None
    }
    message = json.dumps(payload)
    
    if HAS_REDIS and redis_client:
        try:
            # Publish to Redis channel in a separate thread so it doesn't block the async event loop
            await asyncio.to_thread(redis_client.publish, channel, message)
            return
        except Exception as exc:
            logger.error(f"Failed to publish to Redis: {exc}")
            
    logger.debug(f"[InMemory Event Bus] Publish {channel} -> {event_type}: {data}")
