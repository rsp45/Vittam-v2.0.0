import { AlertTriangle, ShieldCheck, TrendingUp, Bell } from "lucide-react";

type Regime = "STABLE" | "TRENDING" | "PANIC";

const regimeMap: Record<
  Regime,
  { color: string; bg: string; glow: string; label: string; icon: any }
> = {
  STABLE: {
    color: "text-cyan-glow",
    bg: "bg-cyan-glow/10 border-cyan-glow/20",
    glow: "glow-cyan",
    label: "Markets are mean-reverting · low dispersion volatility regimes",
    icon: ShieldCheck,
  },
  TRENDING: {
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
    glow: "glow-violet",
    label: "Directional momentum building · widening stop boundaries",
    icon: TrendingUp,
  },
  PANIC: {
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    glow: "glow-crimson",
    label: "Extreme dislocation detected · de-risk exposure immediately",
    icon: AlertTriangle,
  },
};

interface AlertItem {
  t: string;
  msg: string;
  tag: string;
  tone: "cyan" | "violet" | "amber" | "crimson";
}

interface CommandCenterProps {
  regime?: Regime;
  vol?: number;
  confidence?: number;
  alerts?: AlertItem[];
}

const defaultAlerts: AlertItem[] = [
  {
    t: "12:04:21",
    msg: "Promotion event: challenger v2138 → champion",
    tag: "PROMO",
    tone: "violet",
  },
  {
    t: "12:03:58",
    msg: "Stale feed detected on CME ES1 · failover to NYSE",
    tag: "FEED",
    tone: "amber",
  },
  { t: "12:03:11", msg: "VPIN proxy crossed 0.42 threshold", tag: "RISK", tone: "crimson" },
  { t: "12:02:40", msg: "Nexus Engine pipeline completed 3,418 forecasts", tag: "OK", tone: "cyan" },
];

export function CommandCenter({
  regime = "STABLE",
  vol = 0,
  confidence = 0.946,
  alerts = defaultAlerts,
}: CommandCenterProps) {
  const r = regimeMap[regime] || regimeMap["STABLE"];
  const Icon = r.icon;

  return (
    <section className={`relative overflow-hidden rounded-2xl glass-strong ${r.glow} animate-rise`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            // COMMAND_CENTER_STATUS
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground border">
            V4.2 LIVE
          </span>
        </div>

        {/* Regime cockpit banner */}
        <div className={`mt-5 rounded-xl border p-5 transition-all duration-500 bg-gradient-to-br ${r.bg}`}>
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-card border shadow-sm text-foreground">
              <Icon className="h-6 w-6 animate-pulse-soft" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80">
                Current Market Regime
              </div>
              <div className="font-sans text-3xl font-black tracking-tight text-foreground mt-0.5">
                {regime}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Regime Confidence
              </div>
              <div className="font-mono text-2xl font-bold text-foreground mt-0.5">
                {(confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-dashed border-border/30 pt-3 font-mono text-[11px] text-muted-foreground">
            {r.label}
          </div>
        </div>

        {/* Volatility gauge panel */}
        <div className="mt-6 rounded-xl border bg-secondary/30 p-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Volatility Temperature (σ)</span>
            <span className="font-bold text-foreground">{vol.toFixed(1)} / 100</span>
          </div>
          <div className="relative mt-2.5 h-3 overflow-hidden rounded-full border bg-background shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-glow via-amber-glow to-crimson-glow transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(2, vol))}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-1 bg-foreground rounded shadow-lg transition-all duration-1000"
              style={{ left: `${Math.min(99, Math.max(1, vol))}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
            <span>stable (calm)</span>
            <span>trending (momentum)</span>
            <span>panic (extreme)</span>
          </div>
        </div>

        {/* Dynamic Alert rail */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Bell className="h-3.5 w-3.5" /> Live Signal Feed
          </div>
          <ul className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scroll">
            {alerts.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 font-mono text-[11px] hover:bg-card hover:border-border/80 transition-all duration-350 transform hover:-translate-y-0.5 shadow-sm"
              >
                <span className="text-muted-foreground/60 font-semibold">{a.t}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold tracking-wider border shadow-sm
                  ${a.tone === "violet" ? "bg-violet-glow/10 text-violet-glow border-violet-glow/20" : ""}
                  ${a.tone === "amber" ? "bg-amber-glow/10 text-amber-glow border-amber-glow/20" : ""}
                  ${a.tone === "crimson" ? "bg-crimson-glow/10 text-crimson-glow border-crimson-glow/20" : ""}
                  ${a.tone === "cyan" ? "bg-cyan-glow/10 text-cyan-glow border-cyan-glow/20" : ""}`}
                >
                  {a.tag}
                </span>
                <span className="truncate text-foreground/90 font-sans font-medium flex-1">{a.msg}</span>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="text-center py-6 font-mono text-[11px] text-muted-foreground border border-dashed rounded-lg bg-card/20">
                No active signals streamed on rail.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
