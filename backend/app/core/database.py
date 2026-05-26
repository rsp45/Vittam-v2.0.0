from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

logger = logging.getLogger("vittam.database")

# Thread-safe in-memory fallbacks if database is disabled or unavailable
_IN_MEMORY_TICKS: list[dict[str, object]] = []
_IN_MEMORY_FEATURES: list[dict[str, object]] = []
_IN_MEMORY_SHIFTS: list[dict[str, object]] = []

HAS_DATABASE = False
engine = None
SessionLocal = None

try:
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, Boolean, create_engine
        from sqlalchemy.orm import declarative_base, sessionmaker
        
        # Connect to TimescaleDB or Postgres
        engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 5})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base = declarative_base()

        class DBMarketTick(Base):
            __tablename__ = "ticks"
            id = Column(Integer, primary_key=True, index=True)
            symbol = Column(String, index=True)
            price = Column(Float)
            bid = Column(Float)
            ask = Column(Float)
            bid_size = Column(Float)
            ask_size = Column(Float)
            volume = Column(Float)
            timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

        class DBFeatureVector(Base):
            __tablename__ = "features"
            id = Column(Integer, primary_key=True, index=True)
            symbol = Column(String, index=True)
            realized_volatility = Column(Float)
            order_flow_imbalance = Column(Float)
            spread = Column(Float)
            vpin_proxy = Column(Float)
            timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

        class DBRegimeShift(Base):
            __tablename__ = "regime_shifts"
            id = Column(Integer, primary_key=True, index=True)
            symbol = Column(String, index=True)
            regime = Column(String)
            confidence = Column(Float)
            price = Column(Float)
            timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

        # Try to create tables
        Base.metadata.create_all(bind=engine)
        HAS_DATABASE = True
        logger.info("Successfully connected to PostgreSQL/TimescaleDB and initialized schemas!")
except Exception as exc:
    logger.warning(f"Database connection failed or packages missing ({exc}). Operating in graceful in-memory mode.")
    HAS_DATABASE = False

def save_tick(symbol: str, price: float, bid: float, ask: float, bid_size: float, ask_size: float, volume: float) -> None:
    data = {
        "symbol": symbol,
        "price": price,
        "bid": bid,
        "ask": ask,
        "bid_size": bid_size,
        "ask_size": ask_size,
        "volume": volume,
        "timestamp": datetime.now(timezone.utc)
    }
    
    if HAS_DATABASE and SessionLocal:
        try:
            db = SessionLocal()
            tick = DBMarketTick(**data)
            db.add(tick)
            db.commit()
            db.close()
            return
        except Exception as exc:
            logger.error(f"Failed to save tick to database: {exc}")
            
    _IN_MEMORY_TICKS.append(data)
    if len(_IN_MEMORY_TICKS) > 1000:
        _IN_MEMORY_TICKS.pop(0)

def save_features(symbol: str, realized_volatility: float, order_flow_imbalance: float, spread: float, vpin_proxy: float) -> None:
    data = {
        "symbol": symbol,
        "realized_volatility": realized_volatility,
        "order_flow_imbalance": order_flow_imbalance,
        "spread": spread,
        "vpin_proxy": vpin_proxy,
        "timestamp": datetime.now(timezone.utc)
    }
    
    if HAS_DATABASE and SessionLocal:
        try:
            db = SessionLocal()
            feat = DBFeatureVector(**data)
            db.add(feat)
            db.commit()
            db.close()
            return
        except Exception as exc:
            logger.error(f"Failed to save features to database: {exc}")
            
    _IN_MEMORY_FEATURES.append(data)
    if len(_IN_MEMORY_FEATURES) > 1000:
        _IN_MEMORY_FEATURES.pop(0)

def save_regime_shift(symbol: str, regime: str, confidence: float, price: float) -> None:
    data = {
        "symbol": symbol,
        "regime": regime,
        "confidence": confidence,
        "price": price,
        "timestamp": datetime.now(timezone.utc)
    }
    
    if HAS_DATABASE and SessionLocal:
        try:
            db = SessionLocal()
            shift = DBRegimeShift(**data)
            db.add(shift)
            db.commit()
            db.close()
            return
        except Exception as exc:
            logger.error(f"Failed to save regime shift to database: {exc}")
            
    _IN_MEMORY_SHIFTS.append(data)
    if len(_IN_MEMORY_SHIFTS) > 100:
        _IN_MEMORY_SHIFTS.pop(0)

def get_recent_ticks(limit: int = 100) -> list[dict[str, object]]:
    if HAS_DATABASE and SessionLocal:
        try:
            db = SessionLocal()
            ticks = db.query(DBMarketTick).order_by(DBMarketTick.timestamp.desc()).limit(limit).all()
            result = [
                {
                    "symbol": t.symbol,
                    "price": t.price,
                    "bid": t.bid,
                    "ask": t.ask,
                    "bid_size": t.bid_size,
                    "ask_size": t.ask_size,
                    "volume": t.volume,
                    "timestamp": t.timestamp.isoformat()
                }
                for t in ticks
            ]
            db.close()
            return result[::-1] # return chronological
        except Exception as exc:
            logger.error(f"Failed to query ticks from database: {exc}")
            
    return [
        {**t, "timestamp": t["timestamp"].isoformat()}
        for t in _IN_MEMORY_TICKS[-limit:]
    ]
