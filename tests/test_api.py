from fastapi.testclient import TestClient

from backend.app.main import app


def test_capabilities_lists_agent_and_orchestrator_routes() -> None:
    client = TestClient(app)
    response = client.get("/v1/capabilities")

    assert response.status_code == 200
    payload = response.json()
    assert "POST /v1/agent/generate-model" in payload["routes"]
    assert "POST /v1/orchestrator/run" in payload["routes"]
    assert "GET /v1/orchestrator/history" in payload["routes"]


def test_agent_and_orchestrator_endpoints_respond() -> None:
    client = TestClient(app)

    assert client.post("/v1/agent/generate-model").status_code == 200
    assert client.post("/v1/orchestrator/run").status_code == 200
