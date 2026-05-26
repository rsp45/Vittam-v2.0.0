const BASE_HTTP = "http://127.0.0.1:8000";
const BASE_WS = "ws://127.0.0.1:8000";

const GENERATE_URL = `${BASE_HTTP}/v1/agent/generate-model`;
const ORCHESTRATE_URL = `${BASE_HTTP}/v1/orchestrator/run`;
const HISTORY_URL = `${BASE_HTTP}/v1/orchestrator/history`;

const elements = {
  symbolLabel: document.querySelector("#symbolLabel"),
  generateButton: document.querySelector("#generateButton"),
  orchestrateButton: document.querySelector("#orchestrateButton"),
  wsStatus: document.querySelector("#wsStatus"),
  
  regimePanel: document.querySelector("#regimePanel"),
  regimeBadge: document.querySelector("#regimeBadge"),
  regimeLabel: document.querySelector("#regimeLabel"),
  confidenceLabel: document.querySelector("#confidenceLabel"),
  shiftCountLabel: document.querySelector("#shiftCountLabel"),
  temperatureBar: document.querySelector("#temperatureBar"),
  
  livePriceLabel: document.querySelector("#livePriceLabel"),
  liveVol: document.querySelector("#liveVol"),
  liveSpread: document.querySelector("#liveSpread"),
  liveOfi: document.querySelector("#liveOfi"),
  liveVpin: document.querySelector("#liveVpin"),
  
  generatedCode: document.querySelector("#generatedCode"),
  championRmse: document.querySelector("#championRmse"),
  challengerRmse: document.querySelector("#challengerRmse"),
  improvementRatio: document.querySelector("#improvementRatio"),
  improvementIndicator: document.querySelector("#improvementIndicator"),
  promotionStatus: document.querySelector("#promotionStatus"),
  decisionLabel: document.querySelector("#decisionLabel"),
  decisionReason: document.querySelector("#decisionReason"),
  
  agentLog: document.querySelector("#agentLog"),
  workflowHistory: document.querySelector("#workflowHistory"),
  
  briefingPanel: document.querySelector("#briefingPanel"),
  briefingContent: document.querySelector("#briefingContent"),
};

let realtimeChart = null;
let volatilityWs = null;
let eventsWs = null;
let reconnectTimer = null;

// Initialize Chart.js Double-Axis Streaming Graph
function initChart() {
  const ctx = document.getElementById('realtimeChart').getContext('2d');
  
  realtimeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Price (USD)',
          yAxisID: 'y-price',
          borderColor: 'hsl(175, 80%, 50%)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          data: [],
          tension: 0.2
        },
        {
          label: 'Realized Volatility',
          yAxisID: 'y-vol',
          borderColor: 'hsl(265, 80%, 65%)',
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: true,
          data: [],
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.03)'
          },
          ticks: {
            color: '#8e9e95',
            font: {
              size: 10,
              family: 'JetBrains Mono'
            },
            maxTicksLimit: 8
          }
        },
        'y-price': {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(255, 255, 255, 0.03)'
          },
          ticks: {
            color: '#8e9e95',
            font: {
              size: 10,
              family: 'JetBrains Mono'
            }
          }
        },
        'y-vol': {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#8e9e95',
            font: {
              size: 10,
              family: 'JetBrains Mono'
            }
          }
        }
      }
    }
  });
}

function updateChart(timeline) {
  if (!realtimeChart) return;
  
  const maxPoints = 30;
  const sliced = timeline.slice(-maxPoints);
  
  realtimeChart.data.labels = sliced.map(p => `T-${maxPoints - (sliced.indexOf(p) + 1)}`);
  realtimeChart.data.datasets[0].data = sliced.map(p => p.price);
  realtimeChart.data.datasets[1].data = sliced.map(p => p.realized_volatility);
  
  realtimeChart.update('none'); // silent update
}

// Formatters
function formatPercent(value) {
  if (value === null || value === undefined) return "0.0%";
  return `${(value * 100).toFixed(1)}%`;
}

function formatRmse(value) {
  if (value === null || value === undefined) return "--";
  return Number(value).toFixed(6);
}

// Log message inside Terminal Console
function logToTerminal(msg, type = "SYSTEM") {
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] [${type}] ${msg}\n`;
  elements.agentLog.textContent += line;
  elements.agentLog.scrollTop = elements.agentLog.scrollHeight;
}

// Reset Console
function clearTerminal() {
  elements.agentLog.textContent = "";
}

// UI State Render
function render(data) {
  const regime = String(data.regime).toUpperCase();
  elements.symbolLabel.textContent = `${data.symbol} Live Desk`;
  
  // Regime Panel update
  elements.regimeLabel.textContent = regime;
  elements.regimePanel.setAttribute("data-state", data.regime);
  elements.regimeBadge.textContent = regime;
  elements.confidenceLabel.textContent = `${formatPercent(data.confidence)} confidence`;
  elements.shiftCountLabel.textContent = `${data.shift_count || 0} shifts detected`;
  elements.temperatureBar.style.width = `${Math.round(data.confidence * 100)}%`;
  
  // Indicators update
  elements.livePriceLabel.textContent = `$${Number(data.price || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  elements.liveVol.textContent = formatRmse(data.realized_volatility);
  elements.liveSpread.textContent = `$${Number(data.spread || 0).toFixed(2)}`;
  elements.liveOfi.textContent = formatPercent(data.ofi);
  elements.liveVpin.textContent = Number(data.vpin_proxy || 0).toFixed(4);

  // Scorecard update
  elements.championRmse.textContent = formatRmse(data.validation.champion_rmse);
  elements.challengerRmse.textContent = formatRmse(data.validation.challenger_rmse);
  elements.improvementRatio.textContent = formatPercent(data.validation.improvement_ratio);
  
  if (data.validation.passed) {
    elements.improvementRatio.style.color = "var(--green)";
    elements.improvementIndicator.textContent = "Passed promotion criteria (>= 15% RMSE drop)";
  } else {
    elements.improvementRatio.style.color = "var(--crimson)";
    elements.improvementIndicator.textContent = "Below 15% promotion benchmark";
  }

  // Draw chart
  if (data.timeline) {
    updateChart(data.timeline);
  }
}

// WebSocket Stream Integrations
function connectWebSockets() {
  if (volatilityWs) volatilityWs.close();
  if (eventsWs) eventsWs.close();
  
  elements.wsStatus.innerHTML = `<span class="status-dot"></span> Connecting...`;
  
  // Volatility WebSocket
  volatilityWs = new WebSocket(`${BASE_WS}/v1/stream/volatility`);
  
  volatilityWs.onopen = () => {
    elements.wsStatus.innerHTML = `<span class="status-dot green"></span> Live Stream Active`;
    logToTerminal("Live streaming volatility feed connection established.", "WEBSOCKET");
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  };
  
  volatilityWs.onmessage = (event) => {
    const data = JSON.parse(event.data);
    render(data);
  };
  
  volatilityWs.onclose = () => {
    elements.wsStatus.innerHTML = `<span class="status-dot" style="background: var(--crimson); box-shadow: 0 0 8px var(--crimson);"></span> Offline`;
    logToTerminal("Volatility feed websocket dropped. Attempting reconnection...", "WARNING");
    triggerReconnection();
  };
  
  // Events WebSocket
  eventsWs = new WebSocket(`${BASE_WS}/v1/stream/events`);
  
  eventsWs.onopen = () => {
    logToTerminal("Event bus listener connection established.", "WEBSOCKET");
  };
  
  eventsWs.onmessage = (event) => {
    const wrapper = JSON.parse(event.data);
    const ev = wrapper.event;
    const data = wrapper.data;
    
    if (ev === "REGIME_SHIFT_DETECTED") {
      logToTerminal(`🚨 REGIME SHIFT DETECTED! Price: $${data.price} -> Transition to ${data.regime.toUpperCase()} state. Triggering auto-analysis...`, "GOVERNOR");
    } 
    else if (ev === "MODEL_GENERATION_STARTED") {
      logToTerminal(`Initiated adaptive OpenAI model builder for ${data.regime} volatility regime...`, "RESEARCHER");
    }
    else if (ev === "MODEL_VALIDATION_RESULT") {
      logToTerminal(`Walk-forward validation test complete. Champion: ${formatRmse(data.champion_rmse)} RMSE. Challenger: ${formatRmse(data.generated_rmse)} RMSE. Improvement: ${formatPercent(data.improvement_ratio)}`, "VALIDATOR");
      if (data.issues && data.issues.length) {
        logToTerminal(`Sandbox notices reported: ${data.issues.join("; ")}`, "SANDBOX");
      }
    }
    else if (ev === "MODEL_PROMOTED") {
      logToTerminal(`🎉 SUCCESS: Candidate model beats champion baseline by ${formatPercent(data.improvement_ratio)}. Model promoted successfully!`, "GOVERNOR");
    }
    else if (ev === "MODEL_REJECTED") {
      logToTerminal(`❌ REJECTED: Candidate model failed walkthrough safety audits or did not satisfy improvement targets. Champion baseline retained.`, "GOVERNOR");
    }
    else if (ev === "WORKFLOW_STARTED") {
      logToTerminal(`Multi-Agent RuFlo workflow launched. Intent: ${data.intent}. Symbol: ${data.symbol}`, "ORCHESTRATOR");
    }
    else if (ev === "WORKFLOW_COMPLETED") {
      logToTerminal(`Multi-Agent workflow finished execution. Workflow trace logged to audit. ID: ${data.workflow_id}. Decision: ${data.decision.toUpperCase()}. Reason: ${data.reason}`, "ORCHESTRATOR");
      loadWorkflowHistory();
    }
  };
}

function triggerReconnection() {
  if (!reconnectTimer) {
    reconnectTimer = setInterval(() => {
      logToTerminal("Trying to reconnect web sockets...", "SYSTEM");
      connectWebSockets();
    }, 5000);
  }
}

// Generate Challenger Model REST trigger
async function generateChallenger() {
  elements.generateButton.disabled = true;
  elements.generatedCode.textContent = "AI model builder initiated. Invoking OpenAI compiler sandbox...";
  logToTerminal("Initiated static model generator agent request...", "API");
  
  try {
    const response = await fetch(GENERATE_URL, { method: "POST" });
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    const data = await response.json();
    
    // Side by side editor render
    elements.generatedCode.textContent = data.source_code;
    
    // Update Scorecard directly
    elements.championRmse.textContent = formatRmse(data.benchmark.champion_rmse);
    elements.challengerRmse.textContent = formatRmse(data.benchmark.generated_rmse);
    elements.improvementRatio.textContent = formatPercent(data.benchmark.improvement_ratio);
    
    elements.promotionStatus.setAttribute("data-passed", data.benchmark.passed ? "passed" : "failed");
    elements.decisionLabel.textContent = data.benchmark.passed ? "PROMOTED" : "REJECTED";
    elements.decisionReason.textContent = data.benchmark.passed 
      ? "Challenger beats champion RMSE. Promoted to active prediction desk."
      : `Model rejected. Rationale: ${data.rationale}`;
      
    if (data.benchmark.passed) {
      elements.improvementRatio.style.color = "var(--green)";
      elements.improvementIndicator.textContent = "Passed promotion criteria (>= 15% RMSE drop)";
    } else {
      elements.improvementRatio.style.color = "var(--crimson)";
      elements.improvementIndicator.textContent = "Below 15% promotion benchmark";
    }
    
    logToTerminal(`OpenAI generation result received. Provider: ${data.provider}. Model: ${data.model}`, "AGENT");
  } catch (error) {
    elements.generatedCode.textContent = `Model synthesis unavailable.\nEnsure your local server is running at: ${BASE_HTTP}\n\n${error}`;
    logToTerminal(`OpenAI model synthesis request failed: ${error}`, "ERROR");
  } finally {
    elements.generateButton.disabled = false;
  }
}

// Trigger Multi-Agent Workflow REST trigger
async function triggerOrchestrator() {
  elements.orchestrateButton.disabled = true;
  logToTerminal("Triggering full RuFlo-inspired agentic consensus workflow...", "API");
  
  try {
    const response = await fetch(ORCHESTRATE_URL, { method: "POST" });
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    const data = await response.json();
    logToTerminal(`Consensus trace finished. memory keys resolved: ${data.memory_keys.join(", ")}`, "ORCHESTRATOR");
  } catch (error) {
    logToTerminal(`Agentic consensus workflow execution failed: ${error}`, "ERROR");
  } finally {
    elements.orchestrateButton.disabled = false;
  }
}

// Load past workflow history from database/JSON
async function loadWorkflowHistory() {
  try {
    const response = await fetch(HISTORY_URL);
    if (!response.ok) {
      throw new Error(`API status ${response.status}`);
    }
    const data = await response.json();
    renderHistoryList(data.items || []);
  } catch (error) {
    elements.workflowHistory.innerHTML = `<div class="history-empty">Failed to load history logs.</div>`;
  }
}

function renderHistoryList(items) {
  if (!items.length) {
    elements.workflowHistory.innerHTML = `<div class="history-empty">No workflow history records found.</div>`;
    return;
  }

  elements.workflowHistory.innerHTML = "";
  let latestBriefing = null;
  
  // Render last 5
  items.slice(0, 5).forEach((workflow, idx) => {
    // Helper to get agent payload
    const getPayload = (agentName) => {
      const res = workflow.results.find(r => r.agent === agentName);
      return res ? res.payload : {};
    };
    
    const gov = getPayload("portfolio_governor");
    const builder = getPayload("model_builder");
    const bench = builder.benchmark || {};
    
    if (idx === 0 && gov.briefing) {
      latestBriefing = gov.briefing;
    }
    
    const entry = document.createElement("div");
    entry.className = "history-entry";
    entry.setAttribute("data-decision", gov.decision || "unknown");
    
    const completedTime = new Date(workflow.completed_at).toLocaleTimeString();
    
    entry.innerHTML = `
      <div class="history-entry-top">
        <strong>${workflow.workflow_id}</strong>
        <span>${completedTime}</span>
      </div>
      <p>${(gov.decision || "unknown").toUpperCase()} · ${gov.reason || "no reason log"}</p>
      <small>Quality Improvement: ${formatPercent(bench.improvement_ratio || 0)} · Provider: ${builder.provider || "mock"}</small>
    `;
    elements.workflowHistory.appendChild(entry);
  });
  
  if (latestBriefing && elements.briefingPanel) {
    elements.briefingContent.textContent = latestBriefing;
    elements.briefingPanel.style.display = "flex";
  }
}

// Hook Listeners & Boot
elements.generateButton.addEventListener("click", generateChallenger);
elements.orchestrateButton.addEventListener("click", triggerOrchestrator);

initChart();
connectWebSockets();
loadWorkflowHistory();
logToTerminal("System Boot Completed. Live control desk activated.", "SYSTEM");
