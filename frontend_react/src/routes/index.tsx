import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/vittam/Topbar";
import { ParticleBackground } from "@/components/vittam/ParticleBackground";
import { useTheme } from "@/hooks/use-theme";
import {
  ArrowRight,
  Activity,
  Cpu,
  LineChart,
  ShieldCheck,
  Zap,
  Sparkles,
  BookOpen,
  Users,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function EvolutionSection() {
  return (
    <section className="relative border-t bg-black/95 text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="mx-auto max-w-[1280px] px-6 py-24 relative z-10">
        <div className="mb-16 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-glow/30 bg-violet-glow/5 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-glow font-bold">
            <Zap className="h-3.5 w-3.5 animate-pulse" /> Paradigm Shift
          </div>
          <h2 className="mt-5 font-sans text-3xl font-black tracking-tight text-white md:text-5xl">
            The Evolution of Volatility
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-balance font-sans text-zinc-400 md:text-base font-medium">
            We started by proving that simple linear models (HAR-RV-X) could forecast macro-sensitive volatility. But the market doesn't wait for daily batch jobs. Vittam 2.0 rewrites the rules.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Vittam 1.0 Card */}
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm transition-all hover:bg-zinc-900/80">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 font-bold">
              Legacy Project
            </div>
            <h3 className="mb-6 font-mono text-xl font-bold text-zinc-100">VITTAM 1.0</h3>
            <ul className="space-y-4 font-mono text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><strong className="text-zinc-200">Static Architecture:</strong> Pre-trained HAR-RV-X models that decay over time.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><strong className="text-zinc-200">Daily Frequency:</strong> End-of-day Parkinson volatility estimation.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><strong className="text-zinc-200">Manual Intervention:</strong> Human-in-the-loop retraining and deployment.</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-zinc-800/80">
              <Link to="/legacy" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition">
                View Archive <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Vittam 2.0 Card */}
          <div className="relative rounded-2xl border border-cyan-glow/30 bg-cyan-glow/5 p-8 backdrop-blur-sm shadow-[0_0_40px_-15px_var(--cyan-glow)] transition-all hover:bg-cyan-glow/10">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-2 rounded-full border border-cyan-glow/50 bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-glow font-bold shadow-lg shadow-cyan-glow/20">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-glow" />
              In Production
            </div>
            <h3 className="mb-6 font-mono text-xl font-black text-white drop-shadow-md">VITTAM 2.0</h3>
            <ul className="space-y-4 font-mono text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-glow shadow-[0_0_8px_var(--cyan-glow)]" />
                <span><strong className="text-white">Dynamic Generation:</strong> Live AST generation & hot-swapping via Agentic LLMs.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-glow shadow-[0_0_8px_var(--cyan-glow)]" />
                <span><strong className="text-white">Real-Time Streams:</strong> 84ms latency on microstructure order book flow.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-glow shadow-[0_0_8px_var(--cyan-glow)]" />
                <span><strong className="text-white">Autonomous Consensus:</strong> Multi-agent Risk Guards and Portfolio Governors.</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-cyan-glow/20 flex gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-glow/80">
                <Activity className="h-3.5 w-3.5" /> Auto-Adapting
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-violet-glow/80">
                <Cpu className="h-3.5 w-3.5" /> Zero Decay
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InteractiveGuide() {
  const [activeTab, setActiveTab] = useState(0);

  const steps = [
    {
      title: "1. Stream & Ingest",
      desc: "Live order book and trade feeds are ingested with sub-millisecond latency. Market microstructure indicators (VPIN, OFI) are calculated instantly.",
      icon: Activity,
      img: "/images/tutorial-1.png",
      tone: "cyan",
    },
    {
      title: "2. Detect Regime",
      desc: "Continuous Hidden Markov Models classify the market into STABLE, TRENDING, or PANIC states, assigning confidence scores in real-time.",
      icon: Target,
      img: "/images/tutorial-2.png",
      tone: "amber",
    },
    {
      title: "3. Agentic Synthesis",
      desc: "When a regime shift occurs, AI agents dynamically synthesize new challenger algorithms, backtest them, and auto-promote winners to production.",
      icon: Cpu,
      img: "/images/tutorial-3.png",
      tone: "violet",
    },
  ];

  const active = steps[activeTab];

  return (
    <section className="relative border-t bg-card text-foreground">
      <div className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="mb-16 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-glow/30 bg-amber-glow/5 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-glow font-bold">
            <BookOpen className="h-3.5 w-3.5 animate-pulse" /> Platform Guide
          </div>
          <h2 className="mt-5 font-sans text-3xl font-black tracking-tight text-foreground md:text-5xl">
            What is VITTAM 2.0?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-balance font-sans text-muted-foreground md:text-base font-medium">
            VITTAM is a dynamic AI quantitative modeling platform. Unlike static algos that decay
            over time, VITTAM detects structural breaks in the market and writes entirely new
            trading logic to adapt instantly.
          </p>
        </div>

        <div className="mb-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border bg-secondary/25 p-6 hover:shadow-md transition-shadow duration-300">
            <Users className="h-8 w-8 text-cyan-glow mb-4" />
            <h3 className="font-sans text-lg font-bold text-foreground">For Quant Traders</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
              Automate your alpha decay research. Let the agents find the new edge while you define
              risk parameters.
            </p>
          </div>
          <div className="rounded-2xl border bg-secondary/25 p-6 hover:shadow-md transition-shadow duration-300">
            <ShieldCheck className="h-8 w-8 text-amber-glow mb-4" />
            <h3 className="font-sans text-lg font-bold text-foreground">For Risk Managers</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
              Instant alerts when liquidity evaporates or volatility regimes break historical
              bounds.
            </p>
          </div>
          <div className="rounded-2xl border bg-secondary/25 p-6 hover:shadow-md transition-shadow duration-300">
            <Cpu className="h-8 w-8 text-violet-glow mb-4" />
            <h3 className="font-sans text-lg font-bold text-foreground">For Algorithmic Systems</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
              Connect via WebSocket and route your execution logic through our live regime
              confidence bands.
            </p>
          </div>
        </div>

        <h3 className="font-sans text-xl font-bold tracking-tight text-foreground text-center mb-10">
          How it works: An Interactive Tutorial
        </h3>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Tabs */}
          <div className="flex flex-col gap-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = activeTab === i;
              const glowColor =
                s.tone === "cyan"
                  ? "border-cyan-glow/40 bg-cyan-glow/5"
                  : s.tone === "amber"
                    ? "border-amber-glow/40 bg-amber-glow/5"
                    : "border-violet-glow/40 bg-violet-glow/5";
              const textColor =
                s.tone === "cyan"
                  ? "text-cyan-glow"
                  : s.tone === "amber"
                    ? "text-amber-glow"
                    : "text-violet-glow";

              return (
                <button
                  key={s.title}
                  onClick={() => setActiveTab(i)}
                  className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 ${
                    isActive ? glowColor + " shadow-sm" : "border-border bg-secondary/20 hover:bg-secondary/40"
                  }`}
                >
                  <div
                    className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-card border" : "bg-card border"}`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? textColor : "text-muted-foreground"}`} />
                  </div>
                  <h4
                    className={`font-sans text-[15px] font-bold ${isActive ? "text-foreground" : "text-foreground/70"}`}
                  >
                    {s.title}
                  </h4>
                  <p
                    className={`mt-2 text-xs leading-relaxed font-medium ${isActive ? "text-muted-foreground" : "text-muted-foreground/80"}`}
                  >
                    {s.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Viewer */}
          <div
            className="relative overflow-hidden rounded-2xl border bg-secondary/20 flex items-center justify-center group"
            style={{ minHeight: 400 }}
          >
            <div
              className="absolute inset-0 opacity-10 transition-colors duration-500"
              style={{
                background: `linear-gradient(to bottom right, var(--${active.tone === "cyan" ? "cyan" : active.tone === "amber" ? "amber" : "violet"}-glow) 0%, transparent 60%)`,
              }}
            />
            
            {activeTab === 0 && (
              <div className="z-10 flex flex-col items-center justify-center w-full h-full p-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Streaming Data Anim */}
                <div className="w-full max-w-sm border border-cyan-glow/20 rounded-xl bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden">
                  <div className="bg-cyan-glow/10 p-3 border-b border-cyan-glow/20 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-glow">Live Feed ingest</span>
                    <Activity className="h-3.5 w-3.5 text-cyan-glow animate-pulse" />
                  </div>
                  <div className="p-5 flex flex-col gap-2.5 font-mono text-xs overflow-hidden h-[200px] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90 z-10 pointer-events-none" />
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center text-muted-foreground animate-rise" style={{ animationDelay: `${i * 120}ms` }}>
                        <span>BTC/USD</span>
                        <span className="text-cyan-glow font-bold">{(65320.45 + Math.random() * 10).toFixed(2)}</span>
                        <span className={Math.random() > 0.5 ? 'text-green-500/80' : 'text-red-500/80'}>
                          {Math.random() > 0.5 ? '▲' : '▼'} {(Math.random() * 5).toFixed(2)}
                        </span>
                        <span className="opacity-50">{Math.floor(Math.random() * 1000)}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="z-10 flex flex-col items-center justify-center w-full h-full p-8 animate-in fade-in zoom-in-95 duration-500">
                 {/* Regime Gauge */}
                 <div className="relative w-56 h-56 rounded-full border-8 border-secondary/30 flex items-center justify-center shadow-lg bg-card/40 backdrop-blur-sm">
                    <div className="absolute inset-[-4px] rounded-full border-4 border-amber-glow border-t-transparent animate-spin" style={{ animationDuration: '4s' }} />
                    <div className="absolute inset-4 rounded-full border-2 border-amber-glow/40 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-10 rounded-full border border-amber-glow/20 border-r-transparent animate-spin" style={{ animationDuration: '7s' }} />
                    <div className="text-center z-10">
                      <div className="font-mono text-4xl font-black text-amber-glow animate-pulse-soft">98<span className="text-xl">%</span></div>
                      <div className="font-mono text-[9px] mt-1 uppercase tracking-widest text-muted-foreground">Confidence</div>
                      <div className="mt-2 inline-flex rounded border border-amber-glow/30 bg-amber-glow/10 px-2.5 py-1 font-mono text-[10px] font-bold text-amber-glow">
                        TRENDING REGIME
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="z-10 flex flex-col items-center justify-center w-full h-full p-8 animate-in fade-in zoom-in-95 duration-500">
                 {/* Agent Terminal */}
                 <div className="w-full max-w-md border border-violet-glow/20 rounded-xl bg-[#0a0a0a]/90 backdrop-blur-md shadow-2xl overflow-hidden text-left">
                   <div className="bg-secondary/10 p-2.5 border-b border-white/5 flex items-center gap-2">
                     <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                     <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                     <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                     <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-widest text-violet-glow/70">Agentic Sandbox</span>
                   </div>
                   <div className="p-5 font-mono text-[12px] leading-relaxed text-green-400/90 h-[220px] flex flex-col gap-1.5 relative overflow-hidden">
                      <div className="animate-rise" style={{ animationDelay: '0ms' }}>$ nexus-engine init --model=JumpDiffusion</div>
                      <div className="animate-rise text-white/50" style={{ animationDelay: '300ms' }}>{">"} Synthesizing volatility predictors...</div>
                      <div className="animate-rise text-white/50" style={{ animationDelay: '600ms' }}>{">"} Generating AST nodes <span className="text-violet-glow/80">[##########] 100%</span></div>
                      <div className="animate-rise text-white/50" style={{ animationDelay: '900ms' }}>{">"} Running walk-forward cross-validation...</div>
                      <div className="animate-rise text-violet-glow font-bold mt-2" style={{ animationDelay: '1200ms' }}>{">"} Backtest successful. Sharpe Ratio: 3.14</div>
                      <div className="animate-rise text-white font-black mt-2 bg-violet-glow/20 px-2 py-1 inline-block border border-violet-glow/30" style={{ animationDelay: '1500ms' }}>[ PROMOTING TO PRODUCTION ]</div>
                      <div className="absolute bottom-5 right-5 h-4 w-2.5 bg-green-400 animate-pulse" />
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Immersive Hero Volatility Simulator Cockpit ── */
function HeroSimulator() {
  const [activeRegime, setActiveRegime] = useState<"STABLE" | "TRENDING" | "PANIC">("TRENDING");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 900);
    return () => clearInterval(timer);
  }, []);

  const getVolatility = () => {
    const base = activeRegime === "STABLE" ? 8.42 : activeRegime === "TRENDING" ? 22.14 : 64.85;
    const wiggle = Math.sin(tick) * 0.18 + Math.cos(tick * 1.4) * 0.05;
    return (base + wiggle).toFixed(2);
  };

  const getSpread = () => {
    const base = activeRegime === "STABLE" ? 0.012 : activeRegime === "TRENDING" ? 0.048 : 0.422;
    const wiggle = Math.sin(tick * 0.8) * 0.001;
    return (base + wiggle).toFixed(3);
  };

  const getVpin = () => {
    const base = activeRegime === "STABLE" ? 14.2 : activeRegime === "TRENDING" ? 52.8 : 88.5;
    const wiggle = Math.cos(tick * 1.2) * 0.5;
    return (base + wiggle).toFixed(1);
  };

  const getChartPath = () => {
    if (activeRegime === "STABLE") {
      return "M 0 100 Q 40 85, 80 100 T 160 100 T 240 85 T 320 100 T 400 90 T 480 100 T 560 90 T 640 100 T 720 95 T 800 100";
    } else if (activeRegime === "TRENDING") {
      return "M 0 120 Q 40 100, 80 105 T 160 85 T 240 80 T 320 60 T 400 58 T 480 40 T 560 30 T 640 25 T 720 12 T 800 5";
    } else {
      return "M 0 40 Q 40 70, 80 20 T 160 110 T 240 80 T 320 140 T 400 90 T 480 160 T 560 110 T 640 180 T 720 130 T 800 200";
    }
  };

  const getLogLines = () => {
    if (activeRegime === "STABLE") {
      return [
        "[HMM] Classifying microsecond order book signals... [STABLE]",
        "[HMM] HMM state confidence: 97.4% - Normal regime clustering",
        "[Nexus Engine] Consensus established: Model baseline GARCH(1,1) fits perfectly",
        "[SYSTEM] Realized σ within historical 1-sigma bounds",
        "[SYSTEM] Order book liquidity is balanced. Zero toxic skew detected"
      ];
    } else if (activeRegime === "TRENDING") {
      return [
        "[HMM] Classifying microsecond order book signals... [TRENDING]",
        "[HMM] HMM state confidence: 91.2% - Dynamic Regime Shift detected!",
        "[Nexus Engine] Consensus established: Formulate directional scientific alpha",
        "[model_builder] Synthesizing Autoregressive Fractional Brownian Motion class...",
        "[risk_guard] AST code syntax audit compiled: SAFE. Executing validation...",
        "[portfolio_governor] Out-of-sample backtest RMSE improved by 14.2%. Promotion approved!"
      ];
    } else {
      return [
        "[HMM] Classifying microsecond order book signals... [PANIC]",
        "[HMM] HMM state confidence: 98.6% - CRITICAL REGIME CRASH DETECTED!",
        "[Nexus Engine] Consensus established: Activate discontinuous Poisson safety safeguards",
        "[model_builder] Synthesizing Merton Jump Diffusion class with safety tails...",
        "[risk_guard] Warning! Bid-ask spread size exceeds 3x standard deviation threshold",
        "[portfolio_governor] Challenger model promoted to Champion. Production hot-swap successfully completed!"
      ];
    }
  };

  const regimeTextColor =
    activeRegime === "STABLE"
      ? "text-emerald-500"
      : activeRegime === "TRENDING"
        ? "text-cyan-glow"
        : "text-crimson-glow animate-pulse";
  
  const regimeBgColor =
    activeRegime === "STABLE"
      ? "bg-emerald-500/10 border-emerald-500/20"
      : activeRegime === "TRENDING"
        ? "bg-cyan-glow/10 border-cyan-glow/20"
        : "bg-crimson-glow/10 border-crimson-glow/20";

  const chartStroke =
    activeRegime === "STABLE"
      ? "stroke-emerald-500"
      : activeRegime === "TRENDING"
        ? "stroke-cyan-glow"
        : "stroke-crimson-glow";

  const chartFill =
    activeRegime === "STABLE"
      ? "from-emerald-500/10"
      : activeRegime === "TRENDING"
        ? "from-cyan-glow/10"
        : "from-crimson-glow/10";

  return (
    <div className="relative mx-auto mt-20 max-w-[1100px] animate-rise">
      {/* Background glow shadow */}
      <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-cyan-glow/10 via-violet-glow/5 to-transparent blur-2xl opacity-80" />
      
      <div className="overflow-hidden rounded-2xl border bg-card/75 backdrop-blur-xl shadow-xl">
        
        {/* Visual Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-secondary/30 px-5 py-3.5 gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-crimson-glow/70 animate-pulse-soft" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-glow/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-glow/70" />
            <span className="ml-3 font-mono text-[11px] text-foreground/80 font-bold">
              vittam://cockpit-simulator
            </span>
          </div>

          {/* Interactive Preset Buttons */}
          <div className="flex bg-secondary/60 p-0.5 rounded-lg border border-border/40 font-mono text-[9px] font-bold uppercase tracking-wider self-start sm:self-auto">
            <button
              onClick={() => setActiveRegime("STABLE")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeRegime === "STABLE" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Stable Preset
            </button>
            <button
              onClick={() => setActiveRegime("TRENDING")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeRegime === "TRENDING" ? "bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trending Preset
            </button>
            <button
              onClick={() => setActiveRegime("PANIC")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeRegime === "PANIC" ? "bg-crimson-glow/15 text-crimson-glow border border-crimson-glow/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Panic Preset
            </button>
          </div>
        </div>

        {/* Dynamic Simulator Grid */}
        <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Visual Graph & Indicators Column */}
          <div className="space-y-4">
            
            {/* Top Indicator Cards */}
            <div className="grid gap-3 grid-cols-3">
              <div className="rounded-xl border bg-secondary/35 p-4 transition-all duration-300">
                <div className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                  Classified State
                </div>
                <div className={`mt-1 font-sans text-[15px] font-black tracking-wider ${regimeTextColor}`}>
                  {activeRegime}
                </div>
              </div>

              <div className="rounded-xl border bg-secondary/35 p-4 transition-all duration-300">
                <div className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                  Realized Vol (σ)
                </div>
                <div className="mt-1 font-sans text-[15px] font-black tracking-wider text-cyan-glow font-mono">
                  {getVolatility()}%
                </div>
              </div>

              <div className="rounded-xl border bg-secondary/35 p-4 transition-all duration-300">
                <div className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                  Spread size
                </div>
                <div className="mt-1 font-sans text-[15px] font-black tracking-wider text-cyan-glow font-mono">
                  {getSpread()}
                </div>
              </div>
            </div>

            {/* Price Chart SVG Graphic */}
            <div className="relative rounded-xl border bg-secondary/20 p-4 h-[180px] overflow-hidden flex flex-col justify-between">
              <div className="absolute top-3 left-4 flex items-center justify-between w-[92%] font-mono text-[9px] text-muted-foreground font-bold">
                <span>SIMULATED ASSET PRICING</span>
                <span className="text-cyan-glow flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse" /> LIVE STREAM
                </span>
              </div>

              {/* Price Line drawing path */}
              <div className="absolute inset-0 flex items-center justify-center pt-8">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" className={`stop-color-current ${chartFill}`} stopOpacity="0.1" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill path */}
                  <path
                    d={`${getChartPath()} L 800 200 L 0 200 Z`}
                    fill="url(#gradient-area)"
                    className="transition-all duration-700 ease-in-out"
                  />
                  
                  {/* Stroke path */}
                  <path
                    d={getChartPath()}
                    fill="none"
                    strokeWidth="3.5"
                    className={`transition-all duration-700 ease-in-out ${chartStroke}`}
                  />
                </svg>
              </div>

              {/* Volume Bars Mock at Bottom */}
              <div className="h-5 flex items-end gap-[2px] opacity-25 w-full shrink-0 border-t pt-1 relative z-10">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const h = Math.abs(Math.sin(idx + tick) * 12) + 2;
                  return (
                    <div key={idx} className="flex-1 bg-cyan-glow rounded-sm" style={{ height: h }} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Logs Console Column */}
          <div className="rounded-xl border bg-black/95 p-4.5 flex flex-col h-full min-h-[220px] lg:min-h-0 relative overflow-hidden border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3 shrink-0 font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse" />
                orchestration_briefing.log
              </span>
              <span>LIVE FEED</span>
            </div>

            {/* Scrolling log contents */}
            <div className="font-mono text-[10px] leading-relaxed text-zinc-300 flex-1 overflow-y-auto space-y-2 select-text custom-scrollbar pr-1" key={activeRegime}>
              {getLogLines().map((log, index) => {
                const isShift = log.includes("Shift") || log.includes("CRITICAL");
                const isSuccess = log.includes("promoted") || log.includes("fits");
                let color = "text-zinc-300";
                if (isShift) color = "text-amber-400 font-bold";
                else if (isSuccess) color = "text-emerald-400 font-semibold";
                
                return (
                  <div key={index} className={`flex items-start gap-1.5 ${color} animate-in fade-in duration-400`}>
                    <span className="text-zinc-500 shrink-0">{`>`}</span>
                    <span>{log}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1 text-cyan-400 animate-pulse font-bold">
                <span>{`>`} Monitoring microsecond tick flows...</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Topbar theme={theme} onToggleTheme={toggleTheme} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-12">
        <ParticleBackground />
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-20 z-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-glow/10 via-violet-glow/5 to-transparent blur-3xl z-0" />

        <div className="relative mx-auto max-w-[1280px] px-6 pb-24 pt-20 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-glow" />
              v2.0 · agentic release · Q2-2026
            </div>
            <h1 className="mt-6 font-sans text-5xl font-black leading-[1.05] tracking-tight text-foreground md:text-7xl">
              The volatility regime,{" "}
              <span className="bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent">
                modeled in real time.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance font-sans text-[15px] leading-relaxed text-muted-foreground font-medium md:text-lg">
              VITTAM 2.0 is the AI control room for quantitative trading desks. Detect regime shifts
              the instant they form, auto-synthesize challenger models against your champion, and
              promote only what beats production.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold shadow-md hover:brightness-110 transition duration-300"
              >
                Enter Control Room
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-md border bg-card px-6 py-3.5 font-mono text-[11px] uppercase tracking-wider text-foreground hover:bg-secondary transition duration-300"
              >
                <Sparkles className="h-4 w-4 text-violet-glow animate-pulse" />
                Read guide manual
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80 font-bold">
              <span>· 84ms median feed</span>
              <span>· 12 venues</span>
              <span>· SOC 2 · ISO 27001</span>
              <span>· on-prem or VPC</span>
            </div>
          </div>

          {/* Immersive live interactive preview */}
          <HeroSimulator />
        </div>
      </section>

      {/* Pillars */}
      <section className="relative border-t bg-secondary/10">
        <div className="mx-auto max-w-[1280px] px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-glow font-bold">
              // CORE_ARCHITECTURE_CAPABILITIES
            </div>
            <h2 className="mt-3 font-sans text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Four surfaces. One operating picture.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                tone: "cyan",
                title: "Regime Detection",
                body: "Continuous classification across stable, trending, and panic states with confidence bands.",
              },
              {
                icon: Activity,
                tone: "amber",
                title: "Microstructure",
                body: "Realized σ, bid-ask spread, OFI and VPIN proxy streamed every 250ms.",
              },
              {
                icon: LineChart,
                tone: "violet",
                title: "Forecast Monitor",
                body: "Price vs σ̂ with prediction intervals and residual diagnostics.",
              },
              {
                icon: Cpu,
                tone: "crimson",
                title: "Synthesis Lab",
                body: "Agentic challenger generation, scorecard validation, auto-promotion.",
              },
            ].map((p) => {
              const Icon = p.icon;
              const hoverGlow =
                p.tone === "cyan"
                  ? "hover:glow-cyan"
                  : p.tone === "violet"
                    ? "hover:glow-violet"
                    : p.tone === "amber"
                      ? "hover:glow-amber"
                      : "hover:glow-crimson";
              return (
                <div
                  key={p.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:border-foreground/20 hover:-translate-y-0.5 transition-all duration-300 ${hoverGlow}`}
                >
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl border bg-secondary`}
                  >
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mt-4 font-sans text-base font-bold text-foreground">{p.title}</h3>
                  <p className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground font-medium">
                    {p.body}
                  </p>
                  <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50 font-bold border-t pt-3">
                    module · {p.title.toLowerCase().replace(" ", "_")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evolution Section */}
      <EvolutionSection />

      {/* Guide Section */}
      <InteractiveGuide />

      {/* Metrics strip */}
      <section className="relative border-t bg-card">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-px overflow-hidden md:grid-cols-4 bg-border">
          {[
            { k: "Median feed latency", v: "84ms", tone: "cyan" },
            { k: "Forecasts / day", v: "3.4M", tone: "violet" },
            { k: "Challenger uplift (30d)", v: "+14.2%", tone: "amber" },
            { k: "Production uptime", v: "99.998%", tone: "cyan" },
          ].map((m) => {
            const color =
              m.tone === "violet"
                ? "text-violet-glow font-black"
                : m.tone === "amber"
                  ? "text-amber-glow font-black"
                  : "text-cyan-glow font-black";
            return (
              <div key={m.k} className="bg-card px-6 py-12 text-center">
                <div className={`font-mono text-4xl tracking-tight ${color}`}>{m.v}</div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                  {m.k}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t bg-card text-foreground">
        <div className="mx-auto max-w-[1280px] px-6 py-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-glow/30 bg-violet-glow/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-glow font-bold shadow-sm">
            <Zap className="h-3.5 w-3.5 animate-pulse" /> agentic synthesis · in production
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl font-sans text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Trade the regime,{" "}
            <span className="bg-gradient-to-r from-violet-glow to-cyan-glow bg-clip-text text-transparent">
              not the noise.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance font-sans text-muted-foreground font-medium text-sm">
            Deploy VITTAM 2.0 inside your VPC in under an hour. Bring your feeds. Keep your alpha.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-mono text-[11px] uppercase tracking-wider text-primary-foreground font-bold shadow-md hover:brightness-110 transition"
            >
              Open Control Room <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-secondary/20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-8 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold md:flex-row">
          <div>© 2026 VITTAM Systems · build 2026.05.r418</div>
          <div>SOC 2 · ISO 27001 · MiFID II ready</div>
        </div>
      </footer>
    </div>
  );
}
