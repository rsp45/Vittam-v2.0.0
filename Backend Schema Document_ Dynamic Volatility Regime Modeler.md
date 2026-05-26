# Backend Schema Document: Dynamic Volatility Regime Modeler (Revamp 2026)

## 1. Persistence Model
- PostgreSQL/TimescaleDB for durable relational + time-series.
- Redis for low-latency feature/state/event transport.
- Object storage for generated code/model artifacts.

## 2. PostgreSQL Core Tables

### `assets`
- `id` UUID PK
- `symbol` VARCHAR(20) UNIQUE NOT NULL
- `exchange` VARCHAR(50) NOT NULL
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMPTZ DEFAULT now()

### `regime_events`
- `id` UUID PK
- `asset_id` UUID FK -> assets.id
- `detected_at` TIMESTAMPTZ NOT NULL
- `previous_regime` VARCHAR(50)
- `new_regime` VARCHAR(50) NOT NULL
- `confidence` DOUBLE PRECISION NOT NULL
- `feature_snapshot` JSONB NOT NULL

### `generated_models`
- `id` UUID PK
- `asset_id` UUID FK -> assets.id
- `regime_label` VARCHAR(50) NOT NULL
- `architecture_type` VARCHAR(80) NOT NULL
- `source_code_uri` TEXT NOT NULL
- `artifact_uri` TEXT
- `prompt_uri` TEXT NOT NULL
- `model_hash` VARCHAR(128) NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT now()

### `model_validations`
- `id` UUID PK
- `model_id` UUID FK -> generated_models.id
- `validated_at` TIMESTAMPTZ NOT NULL
- `rmse` DOUBLE PRECISION
- `mae` DOUBLE PRECISION
- `dm_stat` DOUBLE PRECISION
- `passed` BOOLEAN NOT NULL
- `failure_reason` TEXT
- `report` JSONB

### `model_deployments`
- `id` BIGSERIAL PK
- `asset_id` UUID FK -> assets.id
- `model_id` UUID FK -> generated_models.id
- `deployed_at` TIMESTAMPTZ NOT NULL
- `deactivated_at` TIMESTAMPTZ
- `deployment_mode` VARCHAR(20) NOT NULL
- `reason` TEXT NOT NULL

### `audit_log`
- `id` BIGSERIAL PK
- `occurred_at` TIMESTAMPTZ NOT NULL
- `actor_type` VARCHAR(20) NOT NULL
- `actor_id` VARCHAR(100)
- `action` VARCHAR(100) NOT NULL
- `entity_type` VARCHAR(50)
- `entity_id` VARCHAR(100)
- `payload` JSONB

## 3. Timescale Hypertables

### `feature_timeseries`
- `time` TIMESTAMPTZ NOT NULL
- `asset_id` UUID NOT NULL
- `rv` DOUBLE PRECISION
- `ofi` DOUBLE PRECISION
- `spread` DOUBLE PRECISION
- `vpin_proxy` DOUBLE PRECISION

### `volatility_forecasts`
- `time` TIMESTAMPTZ NOT NULL
- `asset_id` UUID NOT NULL
- `model_id` UUID NOT NULL
- `forecast_value` DOUBLE PRECISION NOT NULL
- `actual_value` DOUBLE PRECISION

## 4. Redis Keyspace
- `live_features:{asset_id}` -> HASH
- `current_regime:{asset_id}` -> STRING
- `active_model:{asset_id}` -> STRING
- `event_bus` -> STREAM
- `validation_jobs` -> STREAM

## 5. Object Storage Layout
- `models/{asset}/{model_id}/model.py`
- `models/{asset}/{model_id}/metadata.json`
- `models/{asset}/{model_id}/prompt.txt`
- `reports/{asset}/{validation_id}.json`
