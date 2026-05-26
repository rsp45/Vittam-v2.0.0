const API_URL = "http://127.0.0.1:8000/v1/demo/run";

const elements = {
  symbolLabel: document.querySelector("#symbolLabel"),
  refreshButton: document.querySelector("#refreshButton"),
  regimeLabel: document.querySelector("#regimeLabel"),
  confidenceLabel: document.querySelector("#confidenceLabel"),
  temperatureBar: document.querySelector("#temperatureBar"),
  championRmse: document.querySelector("#championRmse"),
  challengerRmse: document.querySelector("#challengerRmse"),
  promotionStatus: document.querySelector("#promotionStatus"),
  timeline: document.querySelector("#timeline"),
  agentLog: document.querySelector("#agentLog"),
};

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatRmse(value) {
  return Number(value).toFixed(6);
}

function renderTimeline(timeline) {
  const latest = timeline.slice(-24);
  elements.timeline.innerHTML = "";

  for (const point of latest) {
    const bar = document.createElement("span");
    bar.className = point.regime;
    bar.title = `Step ${point.step}: ${point.regime}, RV ${point.realized_volatility}`;
    bar.style.height = `${Math.max(16, point.confidence * 100)}%`;
    elements.timeline.appendChild(bar);
  }
}

function renderAgentLog(data) {
  const improvement = formatPercent(data.validation.improvement_ratio);
  const shifts = data.timeline.filter((point) => point.shift_detected);
  const shiftLine =
    shifts.length > 0
      ? `REGIME_SHIFT_DETECTED: ${shifts.length} confirmed transition(s)`
      : "REGIME_SHIFT_DETECTED: none in current replay";

  elements.agentLog.textContent = [
    `${data.product}: simulation replay complete`,
    shiftLine,
    `MODEL_GENERATION_STARTED: ${data.validation.model_id}`,
    `MODEL_VALIDATION_${data.validation.passed ? "PASSED" : "FAILED"}: RMSE delta ${improvement}`,
    `MODEL_PROMOTED: ${data.validation.passed ? "ready for semi-auto approval" : "champion retained"}`,
  ].join("\n");
}

function render(data) {
  const regime = String(data.regime).toUpperCase();
  elements.symbolLabel.textContent = `${data.symbol} live desk`;
  elements.regimeLabel.textContent = regime;
  elements.regimeLabel.dataset.regime = data.regime;
  elements.confidenceLabel.textContent = `${formatPercent(data.confidence)} confidence`;
  elements.temperatureBar.style.width = `${Math.round(data.confidence * 100)}%`;
  elements.championRmse.textContent = formatRmse(data.validation.champion_rmse);
  elements.challengerRmse.textContent = formatRmse(data.validation.challenger_rmse);
  elements.promotionStatus.textContent = `Promotion candidate: ${data.validation.passed ? "passed" : "failed"}`;
  elements.promotionStatus.dataset.passed = String(data.validation.passed);
  renderTimeline(data.timeline);
  renderAgentLog(data);
}

async function loadDemo() {
  elements.refreshButton.disabled = true;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Backend responded ${response.status}`);
    }
    render(await response.json());
  } catch (error) {
    elements.agentLog.textContent = `Backend unavailable.\nStart it with: uvicorn backend.app.main:app --reload\n\n${error}`;
  } finally {
    elements.refreshButton.disabled = false;
  }
}

elements.refreshButton.addEventListener("click", loadDemo);
loadDemo();
