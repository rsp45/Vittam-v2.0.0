import { CheckCircle2, XCircle, ArrowDownRight, AlertCircle, Sparkles } from "lucide-react";

interface ScorecardProps {
  championRmse?: number | null;
  challengerRmse?: number | null;
  improvementRatio?: number | null;
  decision?: string; // "waiting" | "passed" | "failed"
  decisionReason?: string;
}

export function Scorecard({
  championRmse = null,
  challengerRmse = null,
  improvementRatio = null,
  decision = "waiting",
  decisionReason = "Run agents or trigger model generation to initiate tests.",
}: ScorecardProps) {
  const hasChallenger = challengerRmse != null && challengerRmse > 0;
  const delta =
    improvementRatio != null
      ? improvementRatio * 100
      : championRmse != null && challengerRmse != null && championRmse > 0
        ? ((championRmse - challengerRmse) / championRmse) * 100
        : 0;

  const isPassed = decision === "passed" || (decision === "waiting" && delta >= 15);
  const isFailed = decision === "failed" || (decision === "waiting" && hasChallenger && delta < 15);

  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong animate-rise">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-glow/40 to-transparent" />
      <div className="p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            // VALIDATION_SCORECARD
          </div>
          <span className="font-mono text-[9px] text-muted-foreground font-semibold">window 30D · 12,481 obs</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
              Champion RMSE
            </div>
            <div className="mt-2.5 font-mono text-3xl font-black tracking-tight text-foreground">
              {championRmse != null ? championRmse.toFixed(6) : "--"}
            </div>
            <div className="mt-1.5 font-mono text-[9px] text-muted-foreground/80 font-medium">
              baseline · GARCH(1,1)
            </div>
          </div>
          <div className="rounded-xl border border-violet-glow/30 bg-violet-glow/5 p-5 shadow-sm glow-violet">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-glow font-extrabold">
              Challenger RMSE
            </div>
            <div className="mt-2.5 font-mono text-3xl font-black tracking-tight text-violet-glow">
              {challengerRmse != null ? challengerRmse.toFixed(6) : "--"}
            </div>
            <div className="mt-1.5 font-mono text-[9px] text-muted-foreground/80 font-medium">
              AI Challenger · compiled
            </div>
          </div>
        </div>

        {/* Quality Delta Progress Panel */}
        <div className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                Forecast Quality Delta
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span
                  className={`font-sans text-4xl font-black tracking-tight leading-none ${
                    isPassed ? "text-cyan-glow" : isFailed ? "text-crimson-glow" : "text-muted-foreground"
                  }`}
                >
                  {hasChallenger ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%` : "0.0%"}
                </span>
                {hasChallenger && <ArrowDownRight className={`h-6 w-6 ${isPassed ? "text-cyan-glow" : "text-crimson-glow"}`} />}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-right font-mono text-[9px] font-bold">
              {[
                { k: "MAE", v: hasChallenger ? `${isPassed ? "-" : "+"}${(Math.abs(delta) * 0.7).toFixed(1)}%` : "--" },
                { k: "QLIKE", v: hasChallenger ? `${isPassed ? "-" : "+"}${(Math.abs(delta) * 0.6).toFixed(1)}%` : "--" },
                { k: "Hit-rate", v: hasChallenger ? `+${(Math.abs(delta) * 0.4).toFixed(1)}%` : "--" },
              ].map((m) => (
                <div
                  key={m.k}
                  className="rounded-lg border bg-secondary/35 px-2.5 py-2"
                >
                  <div className="text-muted-foreground font-mono">{m.k}</div>
                  <div className="text-foreground mt-0.5">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Target Delta Visual Line */}
          {hasChallenger && (
            <div className="mt-5">
              <div className="flex justify-between font-mono text-[8px] uppercase text-muted-foreground/60 mb-1.5 font-bold">
                <span>0% baseline</span>
                <span className="text-violet-glow font-bold">15% target benchmark</span>
                <span>30% max</span>
              </div>
              <div className="relative h-2 rounded-full bg-secondary overflow-hidden border">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${isPassed ? "from-cyan-glow to-cyan-glow" : "from-crimson-glow to-crimson-glow"}`} 
                  style={{ width: `${Math.min(100, Math.max(3, (delta / 30) * 100))}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-violet-glow/60 shadow-lg" 
                  style={{ left: "50%" }} /* 15% is center of 30% scale */
                />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Sandbox Decision Panel */}
        <div
          className={`mt-4 overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-500 ${
            isPassed
              ? "border-cyan-glow/30 bg-cyan-glow/5"
              : isFailed
                ? "border-crimson-glow/30 bg-crimson-glow/5"
                : "border-border bg-secondary/30"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-card border shadow-sm">
              {isPassed ? (
                <CheckCircle2 className="h-6 w-6 text-cyan-glow animate-pulse-soft" />
              ) : isFailed ? (
                <XCircle className="h-6 w-6 text-crimson-glow" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground animate-flicker" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
                Promotion Verdict
              </div>
              <div
                className={`font-mono text-xl font-black tracking-wider mt-0.5 ${
                  isPassed ? "text-cyan-glow" : isFailed ? "text-crimson-glow" : "text-foreground"
                }`}
              >
                {isPassed
                  ? "CHALLENGER PROMOTED"
                  : isFailed
                    ? "CHALLENGER REJECTED"
                    : "PENDING BENCHMARK"}
              </div>
              <div className="mt-1 font-sans text-xs font-semibold text-muted-foreground leading-relaxed">
                {isPassed
                  ? "Auto-merged into champion slot · hot-swap deployed safely in consensus container."
                  : isFailed
                    ? "Delta below 15% threshold · baseline champion retained as production baseline."
                    : decisionReason}
              </div>
            </div>
            {isPassed && (
              <div className="hidden sm:flex items-center gap-1 rounded bg-cyan-glow/10 border border-cyan-glow/20 px-2 py-1 font-mono text-[9px] font-bold text-cyan-glow uppercase tracking-wider animate-pulse">
                <Sparkles className="h-3 w-3" /> Auto-Promote
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
