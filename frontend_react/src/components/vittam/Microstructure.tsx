import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";

const toneMap: Record<string, string> = {
  cyan: "text-cyan-glow",
  violet: "text-violet-glow",
  amber: "text-amber-glow",
  crimson: "text-crimson-glow",
};

const bgToneMap: Record<string, string> = {
  cyan: "bg-cyan-glow/5 border-cyan-glow/15",
  violet: "bg-violet-glow/5 border-violet-glow/15",
  amber: "bg-amber-glow/5 border-amber-glow/15",
  crimson: "bg-crimson-glow/5 border-crimson-glow/15",
};

const CustomSparkTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-border bg-card/95 px-2 py-1 font-mono text-[9px] text-foreground shadow-md backdrop-blur-md">
        {payload[0].value.toFixed(4)}
      </div>
    );
  }
  return null;
};

function Spark({ data, tone }: { data: number[]; tone: string }) {
  if (!data || data.length < 2) {
    return <div className="h-10 w-full animate-pulse rounded bg-secondary/50" />;
  }

  const chartData = data.map((v, i) => ({ index: i, value: v }));

  const color =
    tone === "cyan"
      ? "oklch(0.62 0.16 250)"
      : tone === "violet"
        ? "oklch(0.68 0.16 270)"
        : tone === "amber"
          ? "oklch(0.80 0.14 75)"
          : "oklch(0.60 0.20 20)";

  return (
    <div className="relative h-12 w-full z-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={<CustomSparkTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <YAxis domain={["auto", "auto"]} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fillOpacity={1}
            fill={`url(#g-${tone})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  volHistory?: number[];
  spreadHistory?: number[];
  ofiHistory?: number[];
  vpinHistory?: number[];
}

export function Microstructure({
  data,
  volHistory = [],
  spreadHistory = [],
  ofiHistory = [],
  vpinHistory = [],
}: Props) {
  const stats = [
    {
      label: "Realized Volatility",
      value: data?.realized_volatility != null ? data.realized_volatility.toFixed(4) : "--",
      unit: "%",
      tone: "amber",
      spark: volHistory.slice(-30),
    },
    {
      label: "Bid-Ask Spread",
      value: data?.spread != null ? data.spread.toFixed(4) : "--",
      unit: "bps",
      tone: "cyan",
      spark: spreadHistory.slice(-30),
    },
    {
      label: "Order Flow Imbalance",
      value: data?.ofi != null ? data.ofi.toFixed(4) : "--",
      unit: "\u03c3",
      tone: "violet",
      spark: ofiHistory.slice(-30),
    },
    {
      label: "VPIN Proxy Index",
      value: data?.vpin_proxy != null ? data.vpin_proxy.toFixed(4) : "--",
      unit: "",
      tone: "crimson",
      spark: vpinHistory.slice(-30),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong animate-rise">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent" />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            // MICROSTRUCTURE_TELEMETRY
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-glow" />
            streaming · 250ms
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`group relative overflow-hidden rounded-xl border p-4 bg-card transition hover:border-foreground/20 hover:-translate-y-0.5 hover:shadow-md duration-300`}
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                {s.label}
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span
                  className={`font-sans text-3xl font-black tracking-tight leading-none ${toneMap[s.tone]}`}
                >
                  {s.value}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground font-bold">{s.unit}</span>
              </div>
              <div className="mt-3 border-t border-dashed border-border/40 pt-3">
                <Spark data={s.spark} tone={s.tone} />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Professional Exchange Ticker Tape */}
        <div className="mt-5 overflow-hidden rounded-xl border bg-secondary/30">
          <div className="flex animate-ticker whitespace-nowrap py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0 gap-10 px-8">
                <span>
                  {data?.symbol || "BTCUSDT"}{" "}
                  <span className="text-cyan-glow font-bold">${Number(data?.price || 68000).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                </span>
                <span>
                  CME ES1 <span className="text-cyan-glow font-bold">4,812.25</span> <span className="text-cyan-glow font-bold">+0.34%</span>
                </span>
                <span>
                  NQ1 <span className="text-cyan-glow font-bold">16,941.50</span> <span className="text-cyan-glow font-bold">+0.51%</span>
                </span>
                <span>
                  VIX <span className="text-amber-glow font-bold">14.62</span> <span className="text-amber-glow font-bold">+2.10%</span>
                </span>
                <span>
                  DXY <span className="text-muted-foreground font-bold">103.84</span> <span className="text-muted-foreground font-bold">-0.08%</span>
                </span>
                <span>
                  GOLD <span className="text-amber-glow font-bold">2,331.40</span> <span className="text-amber-glow font-bold">+0.40%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
