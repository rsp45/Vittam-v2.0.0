import { useEffect, useState, useRef } from "react";
import { MessageSquare, Bot, AlertTriangle, ShieldCheck, TrendingUp, BarChart2 } from "lucide-react";

interface LogItem {
  id: string;
  agent: string;
  role: string;
  message: string;
  timestamp: string;
  tone: "cyan" | "violet" | "amber" | "emerald" | "crimson";
  icon: any;
}

interface Props {
  isOrchestrating: boolean;
  decision?: string;
  decisionReason?: string;
}

const AGENT_SEQUENCE = [
  {
    agent: "Market Analyst",
    role: "Microstructure Feature Parser",
    message: "Scanning VPIN, order book depth acceleration, and order flow imbalances. Volatility clustering detected at 1.45x threshold.",
    tone: "cyan",
    icon: BarChart2,
  },
  {
    agent: "Volatility Researcher",
    role: "Mathematical Strategist",
    message: "Analyzing regime shift. Panic regime detected. Formulating GARCH-continuity and HAR-RV mathematical regression hypothesis.",
    tone: "violet",
    icon: Bot,
  },
  {
    agent: "Model Builder",
    role: "GPT-4o Sandbox Synthesizer",
    message: "Synthesizing GeneratedVolatilityModel class. Initiating AST checks to strip forbidden imports and dunder attributes. Compile succeeded.",
    tone: "emerald",
    icon: ShieldCheck,
  },
  {
    agent: "Risk Guard",
    role: "Exposure Guardian",
    message: "Evaluating risk indexes. System leverage set to low. Sandbox safety score verified. No critical leak vectors detected.",
    tone: "amber",
    icon: AlertTriangle,
  },
  {
    agent: "Portfolio Governor",
    role: "Active Desk Selector",
    message: "Initiating walk-forward tests against baseline champions. Challenger RMSE beats GARCH champion by target threshold. hot-swap deployment approved.",
    tone: "cyan",
    icon: TrendingUp,
  }
];

export function DebateConsole({ isOrchestrating, decision, decisionReason }: Props) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [activeStep, setActiveStep] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOrchestrating) {
      setLogs([]);
      setActiveStep(0);
    }
  }, [isOrchestrating]);

  useEffect(() => {
    if (activeStep >= 0 && activeStep < AGENT_SEQUENCE.length && isOrchestrating) {
      const timer = setTimeout(() => {
        const item = AGENT_SEQUENCE[activeStep];
        setLogs((prev) => [
          ...prev,
          {
            id: String(activeStep),
            agent: item.agent,
            role: item.role,
            message: item.message,
            timestamp: new Date().toLocaleTimeString(),
            tone: item.tone as any,
            icon: item.icon,
          }
        ]);
        setActiveStep(activeStep + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeStep, isOrchestrating]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const borderTone = (tone: string) => {
    switch (tone) {
      case "cyan": return "border-cyan-glow/20 bg-cyan-glow/[0.02]";
      case "violet": return "border-violet-glow/20 bg-violet-glow/[0.02]";
      case "emerald": return "border-emerald-500/20 bg-emerald-500/[0.02]";
      case "amber": return "border-amber-glow/20 bg-amber-glow/[0.02]";
      default: return "border-white/5 bg-white/[0.01]";
    }
  };

  const textTone = (tone: string) => {
    switch (tone) {
      case "cyan": return "text-cyan-glow";
      case "violet": return "text-violet-glow";
      case "emerald": return "text-emerald-400";
      case "amber": return "text-amber-glow";
      default: return "text-white";
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong flex flex-col h-[320px] animate-rise">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-glow/40 to-transparent" />
      <div className="p-4 border-b flex items-center justify-between bg-secondary/15 select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-glow animate-pulse" />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
            // RUFLO_CONSENSUS_DEBATE
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase">
          {isOrchestrating ? (
            <span className="flex items-center gap-1.5 text-cyan-glow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-ping" />
              Debating Consensus...
            </span>
          ) : (
            "System Idle"
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll bg-black/40"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
            <Bot className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
              Awaiting Nexus Engine Trigger...
            </p>
            <p className="text-[10px] text-muted-foreground/45 mt-1 max-w-[280px]">
              Click "Trigger Nexus Engine" to view the multi-agent consensus debate logs in real-time.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const Icon = log.icon;
            return (
              <div 
                key={log.id} 
                className={`p-3 rounded-xl border flex gap-3 animate-slide-in ${borderTone(log.tone)}`}
              >
                <div className={`h-8 w-8 rounded-lg border grid place-items-center flex-shrink-0 ${borderTone(log.tone)}`}>
                  <Icon className={`h-4 w-4 ${textTone(log.tone)}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-[11px] font-bold text-white">{log.agent}</span>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{log.role}</span>
                    </div>
                    <span className="font-mono text-[8px] text-muted-foreground/60">{log.timestamp}</span>
                  </div>
                  <p className="font-mono text-[10px] leading-relaxed text-white/80">{log.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
