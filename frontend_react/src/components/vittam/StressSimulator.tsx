import { useState } from "react";
import { AlertOctagon, TrendingDown, EyeOff, Flame } from "lucide-react";

interface Props {
  onInjectShock?: (type: string) => void;
  isDashboard?: boolean;
}

export function StressSimulator({ onInjectShock }: Props) {
  const [activeShock, setActiveShock] = useState<string | null>(null);

  const handleShock = async (type: string) => {
    setActiveShock(type);
    try {
      const response = await fetch("/v1/demo/stress-shock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (response.ok && onInjectShock) {
        onInjectShock(type);
      }
    } catch (e) {
    } finally {
      setTimeout(() => setActiveShock(null), 3000);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong flex flex-col h-[320px] animate-rise">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-glow/40 to-transparent" />
      <div className="p-4 border-b flex items-center justify-between bg-secondary/15 select-none">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-crimson-glow animate-pulse" />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
            // MARKET_STRESS_INJECTOR
          </h2>
        </div>
        <span className="rounded-md border border-crimson-glow/30 bg-crimson-glow/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-crimson-glow">
          What-If Simulator
        </span>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between bg-black/40">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider leading-relaxed">
            Stress-test the agentic hotswap engine. Inject anomalous microstructural shocks into the live exchange feed and watch the RuFlo Consensus protocol adapt dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Flash Crash */}
          <button
            onClick={() => handleShock("flash_crash")}
            disabled={activeShock !== null}
            className={`flex items-center justify-between rounded-xl border p-3 font-mono text-[10px] uppercase tracking-wider text-left transition select-none ${
              activeShock === "flash_crash"
                ? "bg-crimson-glow/20 border-crimson-glow text-crimson-glow animate-pulse-soft"
                : "bg-secondary/20 border-white/5 hover:border-crimson-glow/40 hover:bg-crimson-glow/5 text-white/95"
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-crimson-glow" />
              <span>Simulate Flash Crash</span>
            </span>
            <span className="text-[9px] text-muted-foreground">Price Drop -35%</span>
          </button>

          {/* Liquidity Dryout */}
          <button
            onClick={() => handleShock("liquidity_dryout")}
            disabled={activeShock !== null}
            className={`flex items-center justify-between rounded-xl border p-3 font-mono text-[10px] uppercase tracking-wider text-left transition select-none ${
              activeShock === "liquidity_dryout"
                ? "bg-amber-glow/20 border-amber-glow text-amber-glow animate-pulse-soft"
                : "bg-secondary/20 border-white/5 hover:border-amber-glow/40 hover:bg-amber-glow/5 text-white/95"
            }`}
          >
            <span className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-amber-glow" />
              <span>Simulate Liquidity Dryout</span>
            </span>
            <span className="text-[9px] text-muted-foreground">Spread Spike 20x</span>
          </button>

          {/* Bull Rally */}
          <button
            onClick={() => handleShock("bull_rally")}
            disabled={activeShock !== null}
            className={`flex items-center justify-between rounded-xl border p-3 font-mono text-[10px] uppercase tracking-wider text-left transition select-none ${
              activeShock === "bull_rally"
                ? "bg-cyan-glow/20 border-cyan-glow text-cyan-glow animate-pulse-soft"
                : "bg-secondary/20 border-white/5 hover:border-cyan-glow/40 hover:bg-cyan-glow/5 text-white/95"
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-cyan-glow" />
              <span>Simulate Bull Rally</span>
            </span>
            <span className="text-[9px] text-muted-foreground">Price Pump +25%</span>
          </button>
        </div>
      </div>
    </section>
  );
}
