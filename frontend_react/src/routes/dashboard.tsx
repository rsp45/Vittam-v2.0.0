import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Topbar } from "@/components/vittam/Topbar";
import { useTheme } from "@/hooks/use-theme";
import { CommandCenter } from "@/components/vittam/CommandCenter";
import { Microstructure } from "@/components/vittam/Microstructure";
import { ForecastMonitor } from "@/components/vittam/ForecastMonitor";
import { SynthesisLab } from "@/components/vittam/SynthesisLab";
import { Scorecard } from "@/components/vittam/Scorecard";
import { ProductTour } from "@/components/vittam/ProductTour";
import { DebateConsole } from "@/components/vittam/DebateConsole";
import { StressSimulator } from "@/components/vittam/StressSimulator";
import { PlayCircle } from "lucide-react";
import { useNotifications } from "@/components/vittam/NotificationContext";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Control Room · VITTAM 2.0" },
      {
        name: "description",
        content:
          "Live volatility regime, microstructure indicators, and AI model synthesis for the VITTAM 2.0 trading system.",
      },
    ],
  }),
});

const MAX_HISTORY = 120;

interface AlertItem {
  t: string;
  msg: string;
  tag: string;
  tone: "cyan" | "violet" | "amber" | "crimson";
}

const defaultChampionCode = `# GarchBaseline Baseline
import numpy as np

class GarchBaseline:
    def __init__(self, alpha=0.94, lam=0.06):
        self.alpha = alpha
        self.lam = lam

    def fit(self, values: list[float]) -> None:
        # Fit rolling realized volatility window levels
        self.level = sum(values[-10:]) / 10.0

    def predict(self, horizon: int) -> list[float]:
        # Return rolling forecast continuity
        return [self.level for _ in range(horizon)]`;

const defaultChallengerCode = `# AI Challenger Model (Autocreated)
No challenger generated yet. 
Try clicking "Generate Challenger" or "Trigger Nexus Engine" to compile a real-time adaptive model.`;

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { emitNotification } = useNotifications();
  const [liveData, setLiveData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [volHistory, setVolHistory] = useState<number[]>([]);
  const [spreadHistory, setSpreadHistory] = useState<number[]>([]);
  const [ofiHistory, setOfiHistory] = useState<number[]>([]);
  const [vpinHistory, setVpinHistory] = useState<number[]>([]);
  const [connected, setConnected] = useState(false);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const wsRef = useRef<WebSocket | null>(null);
  const eventsWsRef = useRef<WebSocket | null>(null);

  // Dynamic States for API Connections
  const [championCode, setChampionCode] = useState(defaultChampionCode);
  const [challengerCode, setChallengerCode] = useState(defaultChallengerCode);
  const [championRmse, setChampionRmse] = useState<number | null>(null);
  const [challengerRmse, setChallengerRmse] = useState<number | null>(null);
  const [improvementRatio, setImprovementRatio] = useState<number | null>(null);
  const [decision, setDecision] = useState<string>("waiting"); // waiting, passed, failed
  const [decisionReason, setDecisionReason] = useState<string>("Run agents or trigger model generation to initiate tests.");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { t: new Date().toLocaleTimeString(), msg: "Live control room connection opened.", tag: "SYS", tone: "cyan" }
  ]);

  const addAlert = useCallback((time: string, msg: string, tag: string, tone: "cyan" | "violet" | "amber" | "crimson") => {
    setAlerts((prev) => {
      const next = [{ t: time, msg, tag, tone }, ...prev];
      return next.slice(0, 50); // limit to last 50 alerts
    });
  }, []);

  const pushToHistory = useCallback(
    (setter: React.Dispatch<React.SetStateAction<number[]>>, value: number) => {
      setter((prev) => {
        const next = [...prev, value];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
    },
    [],
  );

  // Load Past Orchestration Runs
  const loadWorkflowHistory = useCallback(async () => {
    try {
      const response = await fetch("/v1/orchestrator/history");
      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      const items = data.items || [];
      if (items.length > 0) {
        // Find latest governor decision & briefing
        const gov = items[0].results?.find((r: any) => r.agent === "portfolio_governor");
        if (gov?.payload?.briefing) {
          setBriefing(gov.payload.briefing);
        }
        
        // Find builder generated code and metrics
        const builder = items[0].results?.find((r: any) => r.agent === "model_builder");
        if (builder?.payload?.source_code) {
          setChallengerCode(builder.payload.source_code);
        }
        if (builder?.payload?.benchmark) {
          const bench = builder.payload.benchmark;
          setChampionRmse(bench.champion_rmse);
          setChallengerRmse(bench.generated_rmse);
          setImprovementRatio(bench.improvement_ratio);
          setDecision(bench.passed ? "passed" : "failed");
        }
      }
    } catch (error) {}
  }, []);

  const changeSymbol = async (newSymbol: string) => {
    setSymbol(newSymbol);
    setPriceHistory([]);
    setVolHistory([]);
    setSpreadHistory([]);
    setOfiHistory([]);
    setVpinHistory([]);
    try {
      const response = await fetch("/v1/ingest/symbol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: newSymbol })
      });
      if (response.ok) {
        const time = new Date().toLocaleTimeString();
        addAlert(time, `Symbol swapped to ${newSymbol} dynamically. Buffers cleared.`, "SYS", "cyan");
      }
    } catch (error) {
      const time = new Date().toLocaleTimeString();
      addAlert(time, `Failed to swap symbol to ${newSymbol}.`, "SYS", "crimson");
    }
  };

  // API Call: Generate Challenger Model REST trigger
  const generateChallenger = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setChallengerCode("# AI model builder initiated. Invoking OpenAI compiler sandbox...");
    
    try {
      const response = await fetch("/v1/agent/generate-model", { method: "POST" });
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }
      const data = await response.json();
      
      setChallengerCode(data.source_code);
      setChampionRmse(data.benchmark.champion_rmse);
      setChallengerRmse(data.benchmark.generated_rmse);
      setImprovementRatio(data.benchmark.improvement_ratio);
      
      setDecision(data.benchmark.passed ? "passed" : "failed");
      setDecisionReason(data.benchmark.passed 
        ? "Challenger beats champion RMSE. Promoted to active prediction desk."
        : `Model rejected. Rationale: ${data.rationale}`
      );
    } catch (error) {
      setChallengerCode(`# Model synthesis request failed. Ensure backend is running.\n# Error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const runCustomSandbox = async (customCode: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch("/v1/agent/validate-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: customCode })
      });
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }
      const data = await response.json();
      
      setChallengerCode(customCode);
      setChampionRmse(data.benchmark.champion_rmse);
      setChallengerRmse(data.benchmark.generated_rmse);
      setImprovementRatio(data.benchmark.improvement_ratio);
      
      setDecision(data.benchmark.passed ? "passed" : "failed");
      setDecisionReason(data.benchmark.passed 
        ? "Custom manual challenger beats champion RMSE. Promoted to active prediction desk!"
        : `Custom model rejected. Rationale: did not beat champion by 15% or failed safety checks.`
      );
      
      const time = new Date().toLocaleTimeString();
      if (data.benchmark.passed) {
        addAlert(time, `🎉 SUCCESS: Manual candidate promoted with +${((data.benchmark.improvement_ratio || 0) * 100).toFixed(1)}% improvement!`, "PROMO", "cyan");
      } else {
        addAlert(time, `❌ REJECTED: Manual candidate did not satisfy sandbox targets.`, "GOVERNOR", "crimson");
      }
    } catch (error) {
      const time = new Date().toLocaleTimeString();
      addAlert(time, `Manual sandbox run failed. Ensure server is active.`, "SYS", "crimson");
    } finally {
      setIsGenerating(false);
    }
  };

  // API Call: Trigger RuFlo Consensus Pipeline REST trigger
  const triggerRuFlo = async () => {
    if (isOrchestrating) return;
    setIsOrchestrating(true);
    
    try {
      const response = await fetch("/v1/orchestrator/run", { method: "POST" });
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }
      await response.json();
      await loadWorkflowHistory();
    } catch (error) {
    } finally {
      setIsOrchestrating(false);
    }
  };

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host;

    // 1. Establish Volatility Ingestion WebSocket Connection
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/v1/stream/volatility`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      const time = new Date().toLocaleTimeString();
      addAlert(time, "Live streaming volatility feed connection established.", "WEBSOCKET", "cyan");
    };
    
    ws.onclose = () => {
      setConnected(false);
      const time = new Date().toLocaleTimeString();
      addAlert(time, "Volatility feed WebSocket dropped. Attempting reconnect...", "WARNING", "amber");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLiveData(parsed);

        if (parsed.price) pushToHistory(setPriceHistory, parsed.price);
        if (parsed.realized_volatility !== undefined)
          pushToHistory(setVolHistory, parsed.realized_volatility);
        if (parsed.spread !== undefined) pushToHistory(setSpreadHistory, parsed.spread);
        if (parsed.ofi !== undefined) pushToHistory(setOfiHistory, parsed.ofi);
        if (parsed.vpin_proxy !== undefined) pushToHistory(setVpinHistory, parsed.vpin_proxy);

        // Map baseline details from websocket initially if available
        if (parsed.validation && championRmse === null) {
          setChampionRmse(parsed.validation.champion_rmse);
          setChallengerRmse(parsed.validation.challenger_rmse);
          setImprovementRatio(parsed.validation.improvement_ratio);
          setDecision(parsed.validation.passed ? "passed" : "waiting");
        }
      } catch (e) {}
    };

    // 2. Establish Multi-Agent Event Bus WebSocket Connection
    const eventsWs = new WebSocket(`${wsProtocol}//${wsHost}/v1/stream/events`);
    eventsWsRef.current = eventsWs;

    eventsWs.onopen = () => {
      const time = new Date().toLocaleTimeString();
      addAlert(time, "Multi-Agent event bus listener established.", "WEBSOCKET", "cyan");
    };

    eventsWs.onmessage = (event) => {
      try {
        const wrapper = JSON.parse(event.data);
        const ev = wrapper.event;
        const data = wrapper.data;
        const time = new Date().toLocaleTimeString();

        if (ev === "NOTIFICATION" && data?.notification) {
          emitNotification(data.notification);
        }

        if (ev === "REGIME_SHIFT_DETECTED") {
          addAlert(time, `🚨 REGIME SHIFT! Price: $${Number(data.price || 0).toLocaleString()} -> Transition to ${data.regime.toUpperCase()}`, "GOVERNOR", "crimson");
        }
        else if (ev === "MODEL_GENERATION_STARTED") {
          addAlert(time, `Initiating adaptive OpenAI model builder for ${data.regime} volatility regime...`, "RESEARCHER", "violet");
          setIsGenerating(true);
        }
        else if (ev === "MODEL_VALIDATION_RESULT") {
          addAlert(time, `Validation test complete. Champion: ${data.champion_rmse?.toFixed(6)} RMSE. Challenger: ${data.generated_rmse?.toFixed(6)} RMSE.`, "VALIDATOR", "violet");
          setChampionRmse(data.champion_rmse);
          setChallengerRmse(data.generated_rmse);
          setImprovementRatio(data.improvement_ratio);
          setIsGenerating(false);
        }
        else if (ev === "MODEL_PROMOTED") {
          addAlert(time, `🎉 SUCCESS: Challenger promoted with +${((data.improvement_ratio || 0) * 100).toFixed(1)}% improvement!`, "PROMO", "cyan");
          setDecision("passed");
          setDecisionReason(`Challenger beats champion RMSE by ${((data.improvement_ratio || 0) * 100).toFixed(1)}%. Deployed to active prediction desk.`);
        }
        else if (ev === "MODEL_REJECTED") {
          addAlert(time, `❌ REJECTED: Challenger failed safety or did not satisfy improvement targets.`, "GOVERNOR", "crimson");
          setDecision("failed");
          setDecisionReason(`Model rejected. Rationale: ${data.reason || "failed safety or did not beat champion"}`);
        }
        else if (ev === "WORKFLOW_STARTED") {
          addAlert(time, `Multi-Agent Nexus Engine workflow launched (Intent: ${data.intent})`, "ORCHESTRATOR", "cyan");
          setIsOrchestrating(true);
        }
        else if (ev === "WORKFLOW_COMPLETED") {
          addAlert(time, `Multi-Agent consensus trace finished. Decision: ${data.decision.toUpperCase()}.`, "ORCHESTRATOR", "cyan");
          setIsOrchestrating(false);
          loadWorkflowHistory();
        }
      } catch (e) {}
    };

    // Load initial workflow history on boot
    loadWorkflowHistory();

    return () => {
      ws.close();
      eventsWs.close();
    };
  }, [pushToHistory, addAlert, loadWorkflowHistory, championRmse]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar 
        onGenerateChallenger={generateChallenger}
        onTriggerRuFlo={triggerRuFlo}
        isGenerating={isGenerating}
        isOrchestrating={isOrchestrating}
        connected={connected}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSymbol={symbol}
        onSymbolChange={changeSymbol}
      />
      <main className="mx-auto max-w-[1600px] px-6 py-6 animate-fade-in">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="flex items-center font-sans text-2xl font-semibold tracking-tight text-white animate-slide-in">
              Control Room
              <span className="ml-3 font-mono text-sm font-normal text-muted-foreground">
                {liveData?.symbol || "CONNECTING..."}
              </span>
              <button 
                onClick={() => setIsTourActive(true)}
                className="ml-4 flex items-center gap-1.5 rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-glow transition hover:bg-cyan-glow/20"
              >
                <PlayCircle className="h-3 w-3" /> Take Tour
              </button>
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground animate-slide-in">
              session · trader@vittam · region us-east-1 · pid 0xA3F1
            </p>
          </div>
          <div className="hidden gap-2 font-mono text-[10px] uppercase tracking-wider md:flex animate-slide-in">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-muted-foreground">
              WS{" "}
              <span className={connected ? "text-cyan-glow animate-pulse" : "text-crimson-glow"}>
                {connected ? "LIVE" : "OFF"}
              </span>
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-muted-foreground">
              Ticks <span className="text-cyan-glow">{priceHistory.length}</span>
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-muted-foreground">
              Latency p99 <span className="text-amber-glow">3.1ms</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div id="tour-command-center">
            <CommandCenter
              regime={liveData?.regime || "STABLE"}
              vol={liveData?.realized_volatility != null ? liveData.realized_volatility * 1000 : 0}
              confidence={liveData?.confidence || 0}
              alerts={alerts}
            />
          </div>
          <Microstructure
            data={liveData}
            volHistory={volHistory}
            spreadHistory={spreadHistory}
            ofiHistory={ofiHistory}
            vpinHistory={vpinHistory}
          />
        </div>

        <div className="mt-5" id="tour-forecast-monitor">
          <ForecastMonitor 
            priceHistory={priceHistory} 
            volHistory={volHistory} 
            championForecasts={liveData?.champion_forecasts || []}
            challengerForecasts={liveData?.challenger_forecasts || []}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DebateConsole 
            isOrchestrating={isOrchestrating}
            decision={decision}
            decisionReason={decisionReason}
          />
          <StressSimulator 
            onInjectShock={(type) => {
              addAlert(new Date().toLocaleTimeString(), `Stress test triggered: Injected simulated ${type.replace("_", " ")} into exchange feed.`, "SHOCK", "crimson");
            }}
          />
        </div>

        {/* Dynamic Regime Shift Briefing Panel */}
        {briefing && (
          <section className="mt-5 overflow-hidden rounded-2xl glass-strong border border-amber-glow/20 bg-amber-glow/[0.02] p-5 animate-rise shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-glow">
                // REGIME_SHIFT_BRIEFING
              </div>
              <span className="rounded-md border border-amber-glow/40 bg-amber-glow/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-glow">
                New Governor Report
              </span>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-white/90 bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto">
              {briefing}
            </pre>
          </section>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <SynthesisLab 
            championCode={championCode}
            challengerCode={challengerCode}
            isGenerating={isGenerating}
            onResynth={generateChallenger}
            onRunCustomSandbox={runCustomSandbox}
          />
          <Scorecard 
            championRmse={championRmse}
            challengerRmse={challengerRmse}
            improvementRatio={improvementRatio}
            decision={decision}
            decisionReason={decisionReason}
          />
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:flex-row">
          <div>VITTAM 2.0 · build 2026.05.r418 · classified internal</div>
          <div>uptime 17d 04h 12m · 99.998%</div>
        </footer>
      </main>

      <ProductTour 
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
        onClose={() => setIsTourActive(false)}
        steps={[
          {
            targetId: "tour-command-center",
            title: "Live Data Overview",
            description: "This center tracks live tick data, calculates VPIN proxies, and classifies the current market regime using a Hidden Markov Model in real-time."
          },
          {
            targetId: "tour-forecast-monitor",
            title: "Volatility Prediction Widget",
            description: "Watch our champion model and challenger AI models forecast the next volatility trajectory based on live inputs."
          },
          {
            targetId: "tour-primary-controls",
            title: "Agentic Controls",
            description: "Trigger the Nexus Engine to synthesize a challenger model and run automated backtests when you detect market anomalies."
          }
        ]}
      />
    </div>
  );
}
