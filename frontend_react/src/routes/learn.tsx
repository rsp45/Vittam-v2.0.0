import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Topbar } from "@/components/vittam/Topbar";
import { useTheme } from "@/hooks/use-theme";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Activity,
  Target,
  Cpu,
  ShieldCheck,
  LineChart,
  BarChart3,
  Waves,
  Zap,
  GraduationCap,
  TrendingUp,
  Layers,
  Workflow,
  Radio,
  Eye,
  Gauge,
  BrainCircuit,
  FlaskConical,
  Award,
  ArrowUpRight,
  Monitor,
  Play,
  Sliders,
  Terminal,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  head: () => ({
    meta: [
      { title: "Learn VITTAM 2.0 — Beginner's Guide" },
      {
        name: "description",
        content:
          "A visual, interactive guide to understanding VITTAM 2.0's dynamic volatility regime modeling platform.",
      },
    ],
  }),
});

/* ── Glossary Data ── */
const glossary = [
  {
    term: "Volatility",
    icon: Waves,
    simple: "How much the price wiggles.",
    detail:
      "The statistical measure of how much an asset's price moves over time. High volatility = big swings. Low = calm seas.",
    tone: "cyan" as const,
  },
  {
    term: "Regime",
    icon: ShieldCheck,
    simple: "The market's current mood.",
    detail:
      "Markets cycle between 3 moods: STABLE (calm), TRENDING (directional), and PANIC (chaotic). VITTAM detects these in real-time.",
    tone: "amber" as const,
  },
  {
    term: "VPIN",
    icon: BarChart3,
    simple: "A toxicity radar for trades.",
    detail:
      "Volume-synchronized Probability of Informed Trading. It measures how much of the trading volume comes from informed (smart money) traders vs noise.",
    tone: "violet" as const,
  },
  {
    term: "OFI",
    icon: TrendingUp,
    simple: "Who's pushing harder — buyers or sellers?",
    detail:
      "Order Flow Imbalance tracks the difference between buying and selling pressure at the top of the order book, signaling short-term direction.",
    tone: "cyan" as const,
  },
  {
    term: "Champion",
    icon: Award,
    simple: "The current best model running in production.",
    detail:
      "The algorithm that's currently making live predictions. It earned this spot by beating the previous champion on forecast accuracy.",
    tone: "amber" as const,
  },
  {
    term: "Challenger",
    icon: FlaskConical,
    simple: "A new AI model trying to dethrone the Champion.",
    detail:
      "When VITTAM detects a regime shift, it auto-generates a new model (the Challenger) designed for the new market conditions, then tests it against the Champion.",
    tone: "violet" as const,
  },
];

/* ── Timeline Steps ── */
const timeline = [
  {
    step: 1,
    title: "Connect to live markets",
    desc: "VITTAM plugs into real-time data feeds (like Binance). Every trade, every order book update flows in with sub-millisecond latency.",
    icon: Radio,
    flowIcons: [Radio, ArrowRight, Activity, ArrowRight, Zap],
  },
  {
    step: 2,
    title: "Calculate microstructure signals",
    desc: "Raw data becomes intelligence. Spread, volatility, VPIN, and order flow imbalance are computed every 250ms.",
    icon: Gauge,
    flowIcons: [Activity, ArrowRight, Gauge, ArrowRight, BarChart3],
  },
  {
    step: 3,
    title: "Detect the regime",
    desc: "A Hidden Markov Model classifies the market into STABLE, TRENDING, or PANIC with a confidence score.",
    icon: Eye,
    flowIcons: [BarChart3, ArrowRight, BrainCircuit, ArrowRight, Target],
  },
  {
    step: 4,
    title: "Shift detected? Synthesize!",
    desc: "When the regime changes, AI agents write a brand-new trading algorithm from scratch, tailored to the new conditions.",
    icon: BrainCircuit,
    flowIcons: [Target, ArrowRight, BrainCircuit, ArrowRight, Cpu],
  },
  {
    step: 5,
    title: "Champion vs Challenger",
    desc: "The new algorithm (Challenger) is backtested against the current model (Champion). Only the best survives.",
    icon: Layers,
    flowIcons: [Cpu, ArrowRight, Layers, ArrowRight, Award],
  },
  {
    step: 6,
    title: "Auto-promote to production",
    desc: "If the Challenger beats the Champion by >5%, it's automatically promoted. No human intervention needed.",
    icon: Zap,
    flowIcons: [Award, ArrowRight, Zap, ArrowRight, ShieldCheck],
  },
];

/* ── Dashboard Components Data ── */
const dashComponents = [
  {
    title: "Command Center",
    subtitle: "Regime Detection & Alerts",
    desc: "The nerve center of VITTAM. It shows the current market regime (STABLE / TRENDING / PANIC), a confidence score from the Hidden Markov Model, a volatility temperature gauge, and a live alert rail with timestamped system events like regime shifts, feed failures, and model promotions.",
    highlights: [
      "Current regime state with confidence %",
      "Volatility temperature gauge (0-100)",
      "Real-time alert feed with severity tags",
    ],
    icon: ShieldCheck,
    img: "/images/dash-command.png",
  },
  {
    title: "Microstructure Panel",
    subtitle: "Live Market Indicators",
    desc: "Four real-time microstructure indicators that quant traders watch: Realized Volatility, Bid-Ask Spread, Order Flow Imbalance (OFI), and VPIN Proxy. Each card includes a sparkline showing the recent trend, and a scrolling ticker tape shows live asset prices.",
    highlights: [
      "4 live indicators with sparklines",
      "Values update every WebSocket tick",
      "Scrolling ticker tape at bottom",
    ],
    icon: Activity,
    img: "/images/dash-micro.png",
  },
  {
    title: "Forecast Monitor",
    subtitle: "Price vs Implied Volatility",
    desc: "A dual-axis chart overlaying the price trajectory (white line) with the implied volatility forecast (gold area). A dashed forecast band shows the model's forward prediction. On the right, a residual distribution histogram visualizes prediction error distribution.",
    highlights: [
      "Real-time price and volatility overlay",
      "Forward forecast with confidence band",
      "Residual histogram for model diagnostics",
    ],
    icon: LineChart,
    img: "/images/dash-forecast.png",
  },
  {
    title: "Synthesis Lab & Scorecard",
    subtitle: "AI Model Generation & Validation",
    desc: "Two side-by-side code editors show the Champion (current production model) and the AI-generated Challenger. The scorecard below compares RMSE, MAE, QLIKE, and hit-rate between them. If the Challenger improves by >5%, it's auto-promoted.",
    highlights: [
      "Live code comparison with syntax highlighting",
      "RMSE / MAE / QLIKE / Hit-rate metrics",
      "Automatic promotion or rejection decision",
    ],
    icon: Cpu,
    img: "/images/dash-synthesis.png",
  },
];

const faqs = [
  {
    q: "Do I need to know coding to use VITTAM?",
    a: "No. The dashboard is designed to be understood visually. The regime meter, volatility gauge, and alert rail are all point-and-read. The code in the Synthesis Lab is auto-generated by AI — you never need to touch it.",
  },
  {
    q: "What is a 'regime shift' and why does it matter?",
    a: "A regime shift is when the market fundamentally changes behavior — like going from a calm, mean-reverting state to a panic sell-off. Models that worked in one regime often fail in another. VITTAM detects these shifts and adapts automatically.",
  },
  {
    q: "How is this different from a regular trading bot?",
    a: "Most bots run one fixed strategy. When the market changes, they break. VITTAM is meta-adaptive: it doesn't just trade — it rewrites its own trading logic when conditions change. It's a factory that builds trading algorithms on demand.",
  },
  {
    q: "What does 'agentic synthesis' mean?",
    a: "It means AI agents autonomously generate new code. When a regime shift is detected, an AI pipeline designs, writes, backtests, and deploys a new model — all without human intervention. Think of it as self-evolving intelligence.",
  },
  {
    q: "Is the live data real?",
    a: "Yes. The dashboard connects to Binance's live WebSocket feed for BTC/USDT. If the connection drops (e.g., firewall), it seamlessly falls back to a high-fidelity simulator that demonstrates regime shifts.",
  },
  {
    q: "What are RMSE and Forecast Quality Delta?",
    a: "RMSE (Root Mean Square Error) measures prediction error — lower is better. The Forecast Quality Delta shows the percentage improvement of the Challenger over the Champion. Above 5% triggers automatic promotion.",
  },
];

/* ── FAQ Accordion Item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:border-border/80 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left transition hover:bg-secondary/40"
      >
        <span className="font-sans text-[15px] font-bold text-foreground">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t px-5 py-4 text-[13px] leading-relaxed text-muted-foreground bg-secondary/15 animate-in fade-in slide-in-from-top-2 duration-300 font-medium">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Section Label ── */
function SectionLabel({
  icon: Icon,
  label,
  tone = "cyan",
}: {
  icon: any;
  label: string;
  tone?: string;
}) {
  const borderC =
    tone === "cyan"
      ? "border-cyan-glow/20 bg-cyan-glow/5"
      : tone === "amber"
        ? "border-amber-glow/20 bg-amber-glow/5"
        : "border-violet-glow/20 bg-violet-glow/5";
  const textC =
    tone === "cyan" ? "text-cyan-glow" : tone === "amber" ? "text-amber-glow" : "text-violet-glow";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 font-mono text-[9px] uppercase tracking-[0.22em] font-bold ${borderC} ${textC}`}
    >
      <Icon className="h-3.5 w-3.5 animate-pulse-soft" /> {label}
    </div>
  );
}

/* ── Interactive Quant Sandbox Simulator ── */
function InteractiveQuantLab() {
  const [activeTab, setActiveTab] = useState<"hmm" | "synthesis" | "governor">("hmm");

  // Stage 1: HMM state
  const [volatility, setVolatility] = useState(30);
  const [spread, setSpread] = useState(25);
  const [vpin, setVpin] = useState(35);

  // Preset functions
  const setPreset = (type: "stable" | "trending" | "panic") => {
    if (type === "stable") {
      setVolatility(15);
      setSpread(10);
      setVpin(18);
    } else if (type === "trending") {
      setVolatility(45);
      setSpread(30);
      setVpin(52);
    } else if (type === "panic") {
      setVolatility(88);
      setSpread(82);
      setVpin(92);
    }
  };

  // Derive HMM regime
  const score = volatility * 0.4 + vpin * 0.4 + spread * 0.2;
  let regime: "STABLE" | "TRENDING" | "PANIC" = "STABLE";
  let confidence = 0;
  let hypothesisText = "";
  let regimeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  let regimeGlow = "shadow-emerald-500/10 border-emerald-500/20";

  if (score < 35) {
    regime = "STABLE";
    confidence = Math.round(98 - score * 0.4);
    hypothesisText = "Standard GARCH(1,1) model fitted perfectly. Market exhibits low-noise volatility clustering with robust mean reversion. No regime shift detected.";
    regimeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    regimeGlow = "shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)] border-emerald-500/20";
  } else if (score < 68) {
    regime = "TRENDING";
    confidence = Math.round(score * 0.8 + 35);
    hypothesisText = "Strong directional order flow imbalance detected. Traditional GARCH models underperform. Recommend writing a Fractional Brownian Motion model to capture fractal persistence.";
    regimeColor = "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
    regimeGlow = "shadow-[0_0_20px_-3px_rgba(6,182,212,0.15)] border-cyan-500/20";
  } else {
    regime = "PANIC";
    confidence = Math.round(score * 0.3 + 68);
    hypothesisText = "Severe order book toxicity (VPIN > 75%) and extreme bid-ask friction. Standard econometric models fail. Auto-synthesizing Merton Jump Diffusion class to model discrete tail events.";
    regimeColor = "text-crimson-glow bg-crimson-glow/10 border-crimson-glow/20";
    regimeGlow = "shadow-[0_0_20px_-3px_rgba(239,68,68,0.15)] border-crimson-glow/20";
  }

  // Stage 2: Synthesis State
  const [selectedHypothesis, setSelectedHypothesis] = useState<"garch" | "fbm" | "jump">("garch");
  const [synthesisState, setSynthesisState] = useState<"idle" | "compiling" | "completed">("idle");
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fullLogs = [
    "[INFO] Initializing multi-agent Nexus Engine sandbox...",
    "[INFO] Fetching scientific requirements from Regime Detector...",
    `[AGENT: model_builder] Formulating scientific hypothesis for ${regime} regime...`,
    `[AGENT: model_builder] Selected mathematical paradigm: ${selectedHypothesis.toUpperCase()}`,
    "[AGENT: model_builder] Writing Python class VITTAMAdaptiveModel...",
    "[INFO] Model code written successfully. Initiating code safety scan...",
    "[AGENT: risk_guard] Scanning for forbidden functions: import os, sys, eval, exec...",
    "[AGENT: risk_guard] Safety check passed: 0 warnings, 0 security vulnerabilities.",
    "[INFO] Commencing AST verification & compilation checks...",
    "[SUCCESS] Python module compiled and validated in safe runtime sandbox."
  ];

  const startSynthesis = () => {
    setSynthesisState("compiling");
    setCompileLogs([]);
    let currentLogIndex = 0;
    
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    
    logIntervalRef.current = setInterval(() => {
      if (currentLogIndex < fullLogs.length) {
        setCompileLogs((prev) => [...prev, fullLogs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        setSynthesisState("completed");
      }
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, []);

  // Stage 3: Backtest/Governor State
  const [backtestState, setBacktestState] = useState<"idle" | "running" | "completed">("idle");
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [challengerRmse, setChallengerRmse] = useState(0.0450);
  const [challengerHitRate, setChallengerHitRate] = useState(58.0);
  const [isPromoted, setIsPromoted] = useState(false);
  const backtestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBacktest = () => {
    setBacktestState("running");
    setBacktestProgress(0);
    setChallengerRmse(0.0452);
    setChallengerHitRate(58.2);
    setIsPromoted(false);

    if (backtestIntervalRef.current) clearInterval(backtestIntervalRef.current);

    backtestIntervalRef.current = setInterval(() => {
      setBacktestProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          if (backtestIntervalRef.current) clearInterval(backtestIntervalRef.current);
          setBacktestState("completed");
          setChallengerRmse(0.0334);
          setChallengerHitRate(74.6);
          return 100;
        }
        
        // Dynamically tick down RMSE and tick up Hit Rate
        setChallengerRmse((r) => Math.max(0.0334, r - 0.0006));
        setChallengerHitRate((h) => Math.min(74.6, h + 0.8));
        return next;
      });
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (backtestIntervalRef.current) clearInterval(backtestIntervalRef.current);
    };
  }, []);

  const getCodeSnippet = () => {
    if (selectedHypothesis === "garch") {
      return `import numpy as np
from scipy.optimize import minimize

class VITTAMAdaptiveModel:
    """
    Synthesized Autoregressive Volatility Clustering model.
    Custom fitted to: ${regime} market regime.
    """
    def __init__(self, p=1, q=1):
        self.p = p
        self.q = q
        self.params = [0.02, 0.15, 0.80] # [omega, alpha, beta]

    def forecast_variance(self, returns):
        # Dynamically computed volatility recurrence path
        t = len(returns)
        variance = np.zeros(t)
        variance[0] = np.var(returns)
        for i in range(1, t):
            variance[i] = (self.params[0] + 
                           self.params[1] * (returns[i-1]**2) + 
                           self.params[2] * variance[i-1])
        return np.sqrt(variance[-1])`;
    } else if (selectedHypothesis === "fbm") {
      return `import numpy as np

class VITTAMAdaptiveModel:
    """
    Synthesized Fractional Brownian Motion fractional forecasting engine.
    Custom fitted to: ${regime} market regime (Hurst memory persistence).
    """
    def __init__(self, hurst_exponent=0.68):
        self.hurst = hurst_exponent
        self.vol_scaling = 1.25

    def forecast_volatility(self, log_returns):
        # Implements long-range memory scaling parameterization
        n = len(log_returns)
        t = np.arange(1, n + 1)
        # Scale variance over fractional lag window
        lagged_variance = np.var(log_returns) * (t ** (2 * self.hurst))
        return np.sqrt(lagged_variance[-1]) * self.vol_scaling`;
    } else {
      return `import numpy as np

class VITTAMAdaptiveModel:
    """
    Synthesized Merton Jump Diffusion extreme event model.
    Custom fitted to: ${regime} market regime (Fat-tailed discrete jumps).
    """
    def __init__(self, jump_intensity=0.12, jump_mean=-0.05):
        self.lambda_j = jump_intensity
        self.mu_j = jump_mean
        self.sigma_j = 0.08
        self.base_vol = 0.42

    def simulate_tail_volatility(self, historical_vol):
        # Solves discontinuous stochastic differential path
        dt = 1/252
        jump_noise = np.random.poisson(self.lambda_j * dt)
        diffusion_noise = np.random.normal(0, np.sqrt(dt))
        
        # Calculate continuous + jump variance expansion
        total_vol = (self.base_vol * diffusion_noise + 
                     jump_noise * (self.mu_j + self.sigma_j * np.random.normal()))
        return max(historical_vol[-1], np.abs(total_vol))`;
    }
  };

  return (
    <div className="glass-strong rounded-2xl border p-6 md:p-8 mb-24 relative overflow-hidden bg-card/60 backdrop-blur-md">
      {/* Visual top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-glow via-violet-glow to-amber-glow opacity-80" />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <SectionLabel icon={Cpu} label="Interactive Quant Sandbox" tone="violet" />
          <h2 className="mt-3 font-sans text-2xl font-black tracking-tight text-foreground">
            Explore the Adaptation Pipeline
          </h2>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Interact with VITTAM 2.0's core components: detect regimes, trigger AI code synthesis, and benchmark models.
          </p>
        </div>

        {/* Stage selectors */}
        <div className="flex bg-secondary/40 p-1 rounded-xl border self-start md:self-auto shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("hmm")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "hmm"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            }`}
          >
            1. Detect Mood
          </button>
          <button
            onClick={() => setActiveTab("synthesis")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "synthesis"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            }`}
          >
            2. Synthesize AI
          </button>
          <button
            onClick={() => setActiveTab("governor")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "governor"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            }`}
          >
            3. Governor Sandbox
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[420px] grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
        
        {/* TAB 1: HMM CLASSIFIER */}
        {activeTab === "hmm" && (
          <>
            <div className="flex flex-col justify-between gap-6 border-r pr-0 lg:pr-8 border-border/60">
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-base font-black text-foreground flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-cyan-glow" /> Drag Microstructure Sliders
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1 leading-relaxed">
                    VITTAM ingests live order books. Drag the sliders to simulate market shifts and see the Hidden Markov Model classify the state in real-time.
                  </p>
                </div>

                {/* Preset Fast Actions */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">Quick Presets</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreset("stable")}
                      className={`flex-1 py-2 px-3 border rounded-lg font-mono text-[9px] font-bold uppercase transition cursor-pointer ${
                        regime === "STABLE"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/40"
                          : "bg-card text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      Calm Stable
                    </button>
                    <button
                      onClick={() => setPreset("trending")}
                      className={`flex-1 py-2 px-3 border rounded-lg font-mono text-[9px] font-bold uppercase transition cursor-pointer ${
                        regime === "TRENDING"
                          ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/40"
                          : "bg-card text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      Trending Bull
                    </button>
                    <button
                      onClick={() => setPreset("panic")}
                      className={`flex-1 py-2 px-3 border rounded-lg font-mono text-[9px] font-bold uppercase transition cursor-pointer ${
                        regime === "PANIC"
                          ? "bg-crimson-glow/10 text-crimson-glow border-crimson-glow/40"
                          : "bg-card text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      Flash Crash
                    </button>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="space-y-4 pt-2">
                  {/* Slider 1: Volatility */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] font-bold">
                      <span className="text-foreground/75">Realized Volatility (24h)</span>
                      <span className="text-cyan-glow">{volatility}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={volatility}
                      onChange={(e) => setVolatility(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Spread */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] font-bold">
                      <span className="text-foreground/75">Bid-Ask Spread Size</span>
                      <span className="text-cyan-glow">{spread}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={spread}
                      onChange={(e) => setSpread(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: VPIN */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] font-bold">
                      <span className="text-foreground/75">VPIN Toxicity Proxy</span>
                      <span className="text-cyan-glow">{vpin}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={vpin}
                      onChange={(e) => setVpin(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Next Tab Navigation CTA */}
              <div className="pt-4 border-t border-border/40">
                <button
                  onClick={() => setActiveTab("synthesis")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold hover:brightness-110 transition shadow-md cursor-pointer"
                >
                  Proceed to Model Synthesis <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* HMM Output Screen */}
            <div className="flex flex-col justify-between gap-6">
              <div className={`rounded-2xl border p-5 flex flex-col justify-between h-full bg-card/40 transition-all duration-500 shadow-lg ${regimeGlow}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">HMM Classifier Telemetry</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500 font-bold">Live Stream</span>
                    </div>
                  </div>

                  {/* Large Classified Regime Display */}
                  <div className="py-6 border-y border-border/40 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 font-semibold mb-1">Classified Regime State</span>
                    <div className={`px-5 py-2.5 rounded-xl border font-sans text-3xl font-black tracking-wide ${regimeColor}`}>
                      {regime}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                      <span>Confidence score:</span>
                      <span className="text-cyan-glow">{confidence}%</span>
                    </div>
                  </div>

                  {/* AI Agent Analysis */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-sans text-xs font-bold text-foreground">
                      <BrainCircuit className="h-4 w-4 text-cyan-glow animate-pulse-soft" /> Scientific Volatility Hypothesis
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium bg-secondary/20 p-3.5 rounded-xl border border-border/40">
                      {hypothesisText}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-3.5 font-mono text-[8.5px] uppercase text-muted-foreground/60 leading-normal font-semibold">
                  *Hidden Markov model resolves dynamic state transition matrices under Gaussian transition probability criteria.
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: AI MODEL SYNTHESIS */}
        {activeTab === "synthesis" && (
          <>
            <div className="flex flex-col justify-between gap-6 border-r pr-0 lg:pr-8 border-border/60">
              <div className="space-y-5">
                <div>
                  <h3 className="font-sans text-base font-black text-foreground flex items-center gap-2">
                    <BrainCircuit className="h-4.5 w-4.5 text-cyan-glow animate-pulse" /> Select Volatility Formulation
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1 leading-relaxed">
                    VITTAM delegates task parameters to the model-building agent. Choose a scientific paradigm to fit your classified <strong className="text-foreground">{regime}</strong> regime.
                  </p>
                </div>

                {/* Hypothesis options */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setSelectedHypothesis("garch");
                      if (synthesisState === "completed") setSynthesisState("idle");
                    }}
                    className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-300 cursor-pointer ${
                      selectedHypothesis === "garch"
                        ? "border-cyan-glow/30 bg-cyan-glow/5"
                        : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border font-mono text-[9px] font-bold ${
                      selectedHypothesis === "garch" ? "bg-cyan-glow text-background border-cyan-glow/20" : "bg-secondary text-muted-foreground"
                    }`}>
                      1
                    </div>
                    <div>
                      <h4 className="font-sans text-[13px] font-bold text-foreground leading-none">Autoregressive GARCH(1,1)</h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground font-semibold">
                        Captures volatility clustering, persistence, and mean reversion.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHypothesis("fbm");
                      if (synthesisState === "completed") setSynthesisState("idle");
                    }}
                    className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-300 cursor-pointer ${
                      selectedHypothesis === "fbm"
                        ? "border-cyan-glow/30 bg-cyan-glow/5"
                        : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border font-mono text-[9px] font-bold ${
                      selectedHypothesis === "fbm" ? "bg-cyan-glow text-background border-cyan-glow/20" : "bg-secondary text-muted-foreground"
                    }`}>
                      2
                    </div>
                    <div>
                      <h4 className="font-sans text-[13px] font-bold text-foreground leading-none">Fractional Brownian Motion (FBM)</h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground font-semibold">
                        Integrates fractional calculus and Hurst exponent to model long-memory dependencies.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHypothesis("jump");
                      if (synthesisState === "completed") setSynthesisState("idle");
                    }}
                    className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-300 cursor-pointer ${
                      selectedHypothesis === "jump"
                        ? "border-cyan-glow/30 bg-cyan-glow/5"
                        : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border font-mono text-[9px] font-bold ${
                      selectedHypothesis === "jump" ? "bg-cyan-glow text-background border-cyan-glow/20" : "bg-secondary text-muted-foreground"
                    }`}>
                      3
                    </div>
                    <div>
                      <h4 className="font-sans text-[13px] font-bold text-foreground leading-none">Merton Jump Diffusion</h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground font-semibold">
                        Models continuous price diffusion coupled with discrete Poisson jump events.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-border/40">
                {synthesisState === "idle" && (
                  <button
                    onClick={startSynthesis}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold hover:brightness-110 transition shadow-md cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" /> Synthesize adaptively
                  </button>
                )}

                {synthesisState === "compiling" && (
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary/80 border py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-bold"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-glow" /> Compiling AI Challenger...
                  </button>
                )}

                {synthesisState === "completed" && (
                  <button
                    onClick={() => setActiveTab("governor")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold hover:brightness-110 transition shadow-md cursor-pointer"
                  >
                    Proceed to Benchmarking <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Synthesizer Terminal & IDE Output */}
            <div className="flex flex-col justify-between gap-6 min-h-[420px]">
              {synthesisState !== "completed" ? (
                /* Terminal Panel */
                <div className="rounded-2xl border bg-black/95 p-5 flex flex-col h-full shadow-lg relative overflow-hidden border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 shrink-0">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                      <Terminal className="h-3 w-3 text-cyan-glow" /> AI-Synthesis-Terminal
                    </span>
                  </div>

                  {/* Logs output */}
                  <div className="font-mono text-[10.5px] leading-relaxed text-zinc-300 flex-1 overflow-y-auto space-y-2 select-text custom-scrollbar pr-2">
                    {compileLogs.map((log, index) => {
                      const isSuccess = log.includes("[SUCCESS]") || log.includes("passed");
                      const isAgent = log.includes("[AGENT");
                      let color = "text-zinc-300";
                      if (isSuccess) color = "text-emerald-400 font-bold";
                      else if (isAgent) color = "text-cyan-400 font-semibold";
                      
                      return (
                        <div key={index} className={`flex items-start gap-1.5 ${color} animate-in fade-in duration-300`}>
                          <span className="text-zinc-500 tracking-tighter shrink-0">{`>`}</span>
                          <span className="break-all">{log}</span>
                        </div>
                      );
                    })}
                    {synthesisState === "compiling" && (
                      <div className="flex items-center gap-1 text-cyan-400 animate-pulse font-bold">
                        <span>{`>`} Generating mathematical code blocks...</span>
                      </div>
                    )}
                    {synthesisState === "idle" && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
                        <Terminal className="h-10 w-10 text-zinc-700 mb-3 animate-pulse-soft" />
                        <p className="text-xs font-bold uppercase tracking-wider">Terminal Standby</p>
                        <p className="text-[10px] mt-1.5 max-w-[200px] leading-relaxed">Select a volatility hypothesis on the left and click "Synthesize" to compile live code.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* IDE Code Snippet Panel */
                <div className="rounded-2xl border bg-[#050914] p-5 flex flex-col h-full shadow-lg relative overflow-hidden border-zinc-800 animate-in zoom-in-95 duration-400">
                  {/* Interactive Tab header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 shrink-0 font-mono text-[9px] uppercase tracking-wider font-bold">
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-lg text-cyan-glow">
                      <span className="h-2 w-2 rounded-full bg-cyan-glow animate-pulse" />
                      <span>adaptive_model.py</span>
                    </div>
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-glow" /> Synthesized
                    </span>
                  </div>

                  {/* Code editor body */}
                  <div className="flex-1 overflow-auto font-mono text-[10.5px] leading-relaxed text-zinc-300 select-text custom-scrollbar bg-black/20 p-4.5 rounded-xl border border-zinc-800/40">
                    <pre className="whitespace-pre overflow-x-auto text-[9.5px] leading-normal">{getCodeSnippet()}</pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 3: PORTFOLIO GOVERNOR AND WALK-FORWARD BENCHMARK */}
        {activeTab === "governor" && (
          <>
            <div className="flex flex-col justify-between gap-6 border-r pr-0 lg:pr-8 border-border/60">
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-base font-black text-foreground flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-cyan-glow animate-pulse" /> Decision Governor Arena
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1 leading-relaxed">
                    AI-synthesized models must prove themselves. Walk-forward validation backtests the Challenger against the Champion on recent tick data.
                  </p>
                </div>

                {/* Champion vs Challenger Comparison */}
                <div className="space-y-3">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">Model Comparison Overview</span>
                  
                  {/* Model 1: Champion */}
                  <div className="rounded-xl border p-3.5 bg-card/45 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg border bg-amber-500/10 border-amber-500/20 text-amber-500">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-sans text-[12.5px] font-bold text-foreground leading-none">Champion Baseline</h4>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60 font-bold">Production Status</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-foreground">RMSE: 0.0452</div>
                      <div className="text-[9.5px] text-muted-foreground font-semibold">Hit Rate: 58.2%</div>
                    </div>
                  </div>

                  {/* Model 2: Challenger */}
                  <div className="rounded-xl border p-3.5 bg-card/45 flex items-center justify-between shadow-sm border-cyan-glow/20">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg border bg-cyan-500/10 border-cyan-500/20 text-cyan-500">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-sans text-[12.5px] font-bold text-foreground leading-none">AI Challenger</h4>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-cyan-glow font-bold">Synthesized Model</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-cyan-glow">
                        RMSE: {backtestState === "idle" ? "Waiting..." : challengerRmse.toFixed(4)}
                      </div>
                      <div className="text-[9.5px] text-muted-foreground font-semibold">
                        Hit Rate: {backtestState === "idle" ? "Waiting..." : `${challengerHitRate.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backtesting progress */}
                {backtestState === "running" && (
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <div className="flex justify-between font-mono text-[10px] font-bold">
                      <span className="text-muted-foreground">Running Walk-Forward Benchmark...</span>
                      <span className="text-cyan-glow">{backtestProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-lg overflow-hidden border">
                      <div
                        className="h-full bg-cyan-glow transition-all duration-150"
                        style={{ width: `${backtestProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {backtestState === "completed" && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl animate-in zoom-in-95 duration-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-emerald-500">
                      <CheckCircle className="h-4 w-4 shrink-0" /> Validation Check Passed!
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-muted-foreground font-semibold">
                      Challenger improved forecast quality over Champion by <strong className="text-foreground font-bold">+{Math.round(((0.0452 - challengerRmse) / 0.0452) * 100)}%</strong> (Threshold: &ge;5.0%). Safe for promotion!
                    </p>
                  </div>
                )}
              </div>

              {/* Action button */}
              <div className="pt-4 border-t border-border/40 space-y-2">
                {backtestState === "idle" && (
                  <button
                    onClick={startBacktest}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold hover:brightness-110 transition shadow-md cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" /> Run Backtest Validation
                  </button>
                )}

                {backtestState === "completed" && !isPromoted && (
                  <button
                    onClick={() => setIsPromoted(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-mono text-[11px] uppercase tracking-wider text-white font-bold hover:brightness-110 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5" /> PROMOTE TO PRODUCTION
                  </button>
                )}

                {isPromoted && (
                  <button
                    onClick={() => {
                      setBacktestState("idle");
                      setIsPromoted(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-card py-3 font-mono text-[11px] uppercase tracking-wider text-foreground font-bold hover:bg-secondary transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset Sandbox Simulator
                  </button>
                )}
              </div>
            </div>

            {/* Visual Arena / Animation Screen */}
            <div className="flex flex-col justify-between gap-6 min-h-[420px]">
              <div className="rounded-2xl border p-5 flex flex-col items-center justify-center text-center bg-card/45 h-full relative overflow-hidden shadow-lg border-border/60">
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: "radial-gradient(circle at center, var(--cyan-glow), transparent 75%)"
                  }}
                />

                {isPromoted ? (
                  /* Promotion Success Screen */
                  <div className="relative space-y-6 animate-in zoom-in-95 duration-400 z-10">
                    {/* Glowing circular success shield */}
                    <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse-soft">
                      <Zap className="h-7 w-7 text-emerald-500" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-sans text-lg font-black text-foreground">Deployment Successful!</h3>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-500 font-bold">
                        Model hot-swapped in production
                      </p>
                      <p className="max-w-xs mx-auto text-xs text-muted-foreground leading-relaxed font-semibold">
                        The Portfolio Governor has successfully promoted the adaptive mathematical class to lead forecast evaluations.
                      </p>
                    </div>

                    {/* Confetti Explosion Visual Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                      <div className="absolute top-[20%] left-[10%] h-2.5 w-2.5 rounded-full bg-cyan-glow animate-ping" />
                      <div className="absolute top-[40%] right-[15%] h-2 w-2 rounded-full bg-emerald-400 animate-ping delay-200" />
                      <div className="absolute bottom-[30%] left-[25%] h-3 w-3 rounded-full bg-violet-glow animate-ping delay-500" />
                    </div>
                  </div>
                ) : backtestState === "running" ? (
                  /* Animated Backtesting Engine */
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="h-14 w-14 mx-auto rounded-full bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center animate-spin">
                      <RefreshCw className="h-6 w-6 text-cyan-glow" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-sans text-sm font-bold text-foreground">Evaluating walk-forward metrics...</h3>
                      <p className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
                        Simulating {backtestProgress}% of live historical windows
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standby / Done state */
                  <div className="space-y-4">
                    <div className="h-16 w-16 mx-auto rounded-full bg-secondary border flex items-center justify-center">
                      <Award className="h-7 w-7 text-muted-foreground/45 animate-pulse-soft" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-sans text-sm font-bold text-foreground">Sandbox Evaluation Panel</h3>
                      <p className="max-w-[200px] mx-auto text-[11px] text-muted-foreground leading-relaxed font-semibold">
                        {backtestState === "completed"
                          ? "Sandbox benchmark completed successfully. Click the PROMOTE TO PRODUCTION button above to deploy!"
                          : "Configure your model in Steps 1 and 2, then click \"Run Backtest\" to commence walk-forward metrics evaluation."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

/* ── Main Page ── */
function LearnPage() {
  const [activeStep, setActiveStep] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const [expandedGlossary, setExpandedGlossary] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="mx-auto max-w-[1100px] px-6 py-12 animate-fade-in">
        {/* ── Hero ── */}
        <div className="text-center mb-20">
          <SectionLabel icon={GraduationCap} label="Beginner Friendly" />
          <h1 className="mt-6 font-sans text-4xl font-black tracking-tight text-foreground md:text-6xl">
            Learn{" "}
            <span className="bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent">
              VITTAM 2.0
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance font-sans text-[15px] leading-relaxed text-muted-foreground font-medium">
            No PhD required. We explain every concept visually, one step at a time.
          </p>
        </div>

        {/* ── Interactive Quant Sandbox Simulator ── */}
        <InteractiveQuantLab />

        {/* ── Section: VITTAM in Plain English ── */}
        <section className="mb-24 rounded-2xl border bg-secondary/15 p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-glow to-violet-glow opacity-80" />
          <div className="mb-8 max-w-2xl">
            <SectionLabel icon={GraduationCap} label="Plain English Guide" tone="cyan" />
            <h2 className="mt-4 font-sans text-2xl font-black tracking-tight text-foreground">
              VITTAM in Plain English (No Math Degree Required!)
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-semibold">
              Markets can be complicated, but understanding how VITTAM protects and trades doesn't have to be. Here is everything explained in simple, everyday language.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Term 1: Volatility */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow">
                  <Activity className="h-4.5 w-4.5 animate-pulse-soft" />
                </div>
                <h3 className="font-sans text-[13.5px] font-black text-foreground">What is Volatility?</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                Think of volatility like <strong>turbulence on a flight</strong>. 
                <br /><br />
                • <strong>High Volatility</strong> means a bumpy ride with sudden, scary drops and rapid climbs—prices are wiggling wildly.
                <br />
                • <strong>Low Volatility</strong> means a smooth, calm flight where prices stay flat and moves are tiny.
              </p>
            </div>

            {/* Term 2: Market Moods */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg border bg-amber-500/5 border-amber-500/20 text-amber-500">
                  <Eye className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[13.5px] font-black text-foreground">The 3 Market Moods</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                Markets have moods, just like people! We split these moods (or "regimes") into three easy modes:
                <br /><br />
                • <strong>Calm (Stable)</strong>: relaxed trading in a narrow, predictable range.
                <br />
                • <strong>Trending</strong>: focused directional climbing or sliding.
                <br />
                • <strong>Panic</strong>: chaotic price swings as everyone rushes to exit at once.
              </p>
            </div>

            {/* Term 3: How System Works */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg border bg-violet-glow/5 border-violet-glow/20 text-violet-glow">
                  <BrainCircuit className="h-4.5 w-4.5 animate-pulse-soft" />
                </div>
                <h3 className="font-sans text-[13.5px] font-black text-foreground">How VITTAM Works</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                VITTAM acts as a self-evolving trading factory in three steps:
                <br /><br />
                1. <strong>Listen</strong>: Watches real-time exchange streams every millisecond.
                <br />
                2. <strong>Identify</strong>: Detects if the market's mood has shifted from Calm to Panic.
                <br />
                3. <strong>Synthesize</strong>: Instantly triggers AI agents to write a brand new trading model optimized for that new mood.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 1: Key Terms ── */}
        <section className="mb-24">
          <div className="mb-8">
            <SectionLabel icon={BookOpen} label="Key Terms" />
            <h2 className="mt-4 font-sans text-2xl font-black tracking-tight text-foreground">
              Concepts You'll See on the Dashboard
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {glossary.map((g) => {
              const Icon = g.icon;
              const expanded = !!expandedGlossary[g.term];
              const textColor =
                g.tone === "cyan"
                  ? "text-cyan-glow"
                  : g.tone === "amber"
                    ? "text-amber-glow"
                    : "text-violet-glow";
              const borderColor =
                g.tone === "cyan"
                  ? "border-cyan-glow/15 hover:border-cyan-glow/35"
                  : g.tone === "amber"
                    ? "border-amber-glow/15 hover:border-amber-glow/35"
                    : "border-violet-glow/15 hover:border-violet-glow/35";

              return (
                <button
                  key={g.term}
                  onClick={() => setExpandedGlossary(prev => ({ ...prev, [g.term]: !prev[g.term] }))}
                  className={`group rounded-xl border bg-card p-5 text-left transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${borderColor}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="grid h-8 w-8 place-items-center rounded-lg border bg-secondary"
                    >
                      <Icon className={`h-4 w-4 ${textColor}`} />
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-wider ${textColor}`}
                    >
                      {g.term}
                    </span>
                  </div>
                  <p className="text-foreground font-sans text-[14px] font-bold leading-snug">
                    {g.simple}
                  </p>
                  {expanded && (
                    <p className="mt-2 text-[12.5px] text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 font-medium">
                      {g.detail}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold border-t pt-2.5">
                    <ChevronRight
                      className={`h-3 w-3 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
                    />
                    {expanded ? "collapse" : "details"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Section 2: How It Works ── */}
        <section className="mb-24">
          <div className="mb-8">
            <SectionLabel icon={Workflow} label="System Pipeline" tone="amber" />
            <h2 className="mt-4 font-sans text-2xl font-black tracking-tight text-foreground">
              How VITTAM Works
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            {/* Step list */}
            <div className="flex flex-col gap-2.5">
              {timeline.map((t, i) => {
                const isActive = activeStep === i;
                return (
                  <button
                    key={t.step}
                    onClick={() => setActiveStep(i)}
                    className={`group flex items-start gap-4 rounded-xl border p-4.5 text-left transition-all duration-300 shadow-sm ${
                      isActive
                        ? "border-cyan-glow/30 bg-cyan-glow/5"
                        : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold border transition-colors ${
                        isActive ? "bg-cyan-glow text-background border-cyan-glow/20" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {t.step}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`font-sans text-sm font-bold leading-tight ${isActive ? "text-foreground" : "text-foreground/70"}`}
                      >
                        {t.title}
                      </h4>
                      {isActive && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-medium animate-in fade-in duration-500">
                          {t.desc}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visual panel */}
            <div
              className="relative overflow-hidden rounded-2xl border bg-card flex flex-col items-center justify-center p-6 shadow-md"
              style={{ minHeight: 380 }}
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background:
                    "radial-gradient(circle at center, var(--cyan-glow), transparent 70%)",
                }}
              />

              <div className="relative text-center px-8" key={activeStep}>
                {/* Icon flow */}
                <div className="flex items-center justify-center gap-3 mb-8 animate-in fade-in zoom-in-95 duration-500">
                  {timeline[activeStep].flowIcons.map((FlowIcon, idx) => (
                    <FlowIcon
                      key={idx}
                      className={`${
                        idx % 2 === 0 ? "h-10 w-10 text-cyan-glow animate-pulse-soft" : "h-5 w-5 text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <h3 className="font-sans text-lg font-bold text-foreground leading-none">
                  Step {timeline[activeStep].step}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-glow mt-1.5 font-bold">
                  {timeline[activeStep].title}
                </p>
                <p className="mt-4 max-w-sm mx-auto text-xs text-muted-foreground leading-relaxed font-medium">
                  {timeline[activeStep].desc}
                </p>

                {/* Progress dots */}
                <div className="flex gap-2 justify-center mt-8">
                  {timeline.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`h-2 rounded-full transition-all duration-350 ${
                        i === activeStep
                          ? "w-7 bg-cyan-glow"
                          : "w-2 bg-secondary hover:bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Dashboard Anatomy ── */}
        <section className="mb-24">
          <div className="mb-8">
            <SectionLabel icon={ShieldCheck} label="Dashboard Anatomy" tone="violet" />
            <h2 className="mt-4 font-sans text-2xl font-black tracking-tight text-foreground">
              What You See in the Control Room
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-medium">
              Each component of the dashboard serves a specific purpose. Here's what they do.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {dashComponents.map((c, i) => {
              const Icon = c.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={c.title}
                  className={`group rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:border-border/80 hover:shadow-md ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } flex flex-col lg:flex`}
                >
                  {/* Image/Symbol Frame */}
                  <div className="lg:w-[50%] relative overflow-hidden bg-secondary/10 min-h-[240px] flex items-center justify-center border-b lg:border-b-0">
                    <div className="absolute inset-0 opacity-[0.03] grid-bg" />
                    {c.img ? (
                      <img
                        src={c.img}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 select-none"
                      />
                    ) : (
                      <Icon className="h-28 w-28 text-muted-foreground/15 group-hover:scale-105 transition-transform duration-500 animate-pulse-soft" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="lg:w-[50%] p-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-x">
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="grid h-10 w-10 place-items-center rounded-xl border bg-secondary">
                        <Icon className="h-5 w-5 text-cyan-glow" />
                      </div>
                      <div>
                        <h3 className="font-sans text-[16px] font-black text-foreground">{c.title}</h3>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                          {c.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-medium mb-5">
                      {c.desc}
                    </p>
                    <ul className="space-y-2 border-t pt-4">
                      {c.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-[12px] text-foreground/80 font-medium">
                          <ArrowUpRight className="h-4 w-4 shrink-0 mt-0.5 text-cyan-glow font-bold" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section: Concepts You Should Know ── */}
        <section className="mb-24">
          <div className="mb-8">
            <SectionLabel icon={BrainCircuit} label="Core Quant Theory" tone="cyan" />
            <h2 className="mt-4 font-sans text-2xl font-black tracking-tight text-foreground">
              Concepts You Should Know
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-medium">
              A brief primer on the mathematical, economic, and security foundations powering VITTAM 2.0.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Concept 1 */}
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-glow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow group-hover:scale-105 transition-transform duration-300">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[14px] font-black text-foreground">Hidden Markov Models (HMM)</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                A statistical framework that assumes the market cycles between unobserved ("hidden") states. VITTAM uses HMMs to classify dynamic volatility regimes (Stable, Trending, Panic) rather than relying on static, delayed standard indicators.
              </p>
            </div>

            {/* Concept 2 */}
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-glow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow group-hover:scale-105 transition-transform duration-300">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[14px] font-black text-foreground">Autoregressive GARCH(1,1)</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                An econometric cornerstone that models "volatility clustering"—the empirical fact that large market swings tend to be followed by more large swings. GARCH dynamically adapts predictions based on recent historical shocks and variance paths.
              </p>
            </div>

            {/* Concept 3 */}
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-glow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow group-hover:scale-105 transition-transform duration-300">
                  <Gauge className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[14px] font-black text-foreground">VPIN & Microstructure</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                Volume-Synchronized Probability of Informed Trading (VPIN) tracks toxic smart-money flows inside the active order book. By measuring seller/buyer aggressiveness imbalance, VITTAM detects impending liquidity crashes before price shifts.
              </p>
            </div>

            {/* Concept 4 */}
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-glow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow group-hover:scale-105 transition-transform duration-300">
                  <Terminal className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[14px] font-black text-foreground">AST Code Sandboxing</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                Because VITTAM dynamically synthesizes and compiles executable Python models on the fly, it feeds all generated scripts into an Abstract Syntax Tree (AST) scanning guard. This strips builtins and bans dangerous modules to enforce sandbox security.
              </p>
            </div>

            {/* Concept 5 */}
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-glow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow group-hover:scale-105 transition-transform duration-300">
                  <Target className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[14px] font-black text-foreground">Walk-Forward Validation</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                A backtesting standard where candidate algorithms (Challengers) are evaluated on out-of-sample historical tick windows. VITTAM enforces that any Challenger must improve predictive quality (RMSE) by at least 5% to dethrone the current Champion.
              </p>
            </div>

            {/* Concept 6 */}
            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-glow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border bg-cyan-glow/5 border-cyan-glow/20 text-cyan-glow group-hover:scale-105 transition-transform duration-300">
                  <BrainCircuit className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-sans text-[14px] font-black text-foreground">Multi-Agent Consensus</h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground font-medium">
                VITTAM organizes quant research tasks into a coordinated agent coalition (Nexus Engine). The Nexus Engine acts as the central intelligence orchestrator, synthesizing code, running backtests, and seamlessly promoting profitable strategies to production without human intervention. The Model Builder proposes code, the Risk Guard monitors technical and safety constraints, and the Portfolio Governor coordinates the sandbox backtest promotion.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 4: FAQ ── */}
        <section className="mb-24">
          <div className="mb-8">
            <SectionLabel icon={HelpCircle} label="FAQ" tone="amber" />
            <h2 className="mt-4 font-sans text-2xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mb-12 rounded-2xl border border-cyan-glow/20 bg-cyan-glow/5 p-10 text-center shadow-sm animate-rise">
          <Monitor className="h-9 w-9 text-cyan-glow mx-auto mb-4 animate-pulse-soft" />
          <h2 className="font-sans text-xl font-black text-foreground">Ready to explore?</h2>
          <p className="mt-2.5 max-w-md mx-auto text-xs leading-relaxed text-muted-foreground font-semibold">
            Jump into the live Control Room and watch VITTAM detect regimes and synthesize models in
            real-time.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold shadow-md hover:brightness-110 transition"
            >
              Open Control Room <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-2.5 font-mono text-[11px] uppercase tracking-wider text-foreground hover:bg-secondary transition"
            >
              Back to Overview
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-secondary/20">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 px-6 py-8 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold md:flex-row">
          <div>VITTAM Systems 2026 / build 2026.05.r418</div>
          <div>SOC 2 / ISO 27001 / MiFID II</div>
        </div>
      </footer>
    </div>
  );
}
