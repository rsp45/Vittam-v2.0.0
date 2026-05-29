import { useMemo } from "react";
import { ResponsiveContainer, ComposedChart, Line, Area, Tooltip, YAxis } from "recharts";

interface Props {
  priceHistory: number[];
  volHistory: number[];
  championForecasts?: number[];
  challengerForecasts?: number[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-white/10 bg-black/80 px-3 py-2 font-mono text-[10px] shadow-lg backdrop-blur-md">
        <div className="mb-1 text-muted-foreground">{new Date().toLocaleTimeString()}</div>
        <div className="text-white">
          P <span className="text-cyan-glow">{payload[0]?.value?.toFixed(2)}</span>
        </div>
        {payload[1] && (
          <div className="text-white">
            RV <span className="text-violet-glow">{(payload[1]?.value * 100).toFixed(2)}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function ForecastMonitor({ priceHistory, volHistory, championForecasts = [], challengerForecasts = [] }: Props) {
  const hasData = priceHistory.length >= 2;
  const lastPrice = priceHistory[priceHistory.length - 1] || 0;
  const lastVol = volHistory[volHistory.length - 1] || 0;

  const chartData = useMemo(() => {
    const len = Math.max(priceHistory.length, volHistory.length);
    const data = [];
    for (let i = 0; i < len; i++) {
      data.push({
        index: i,
        price: priceHistory[i],
        vol: volHistory[i] || null,
        champForecast: null,
        challForecast: null,
      });
    }

    if (len > 0 && championForecasts.length > 0) {
      // Connect smoothly from last historical volatility point
      const lastVolVal = volHistory[volHistory.length - 1] || 0.01;
      
      // Let's add the first connector point matching the last historical state
      data.push({
        index: len,
        price: null,
        vol: null,
        champForecast: lastVolVal,
        challForecast: lastVolVal,
      });
      
      championForecasts.forEach((val, idx) => {
        data.push({
          index: len + 1 + idx,
          price: null,
          vol: null,
          champForecast: val,
          challForecast: challengerForecasts[idx] !== undefined ? challengerForecasts[idx] : val,
        });
      });
    }
    return data;
  }, [priceHistory, volHistory, championForecasts, challengerForecasts]);

  // Live residual distribution based on vol data
  const residuals = useMemo(() => {
    if (volHistory.length < 10) {
      return Array.from({ length: 24 }, (_, i) => Math.exp(-Math.pow((i - 12) / 4, 2)) * 60);
    }
    const mean = volHistory.reduce((a, b) => a + b, 0) / volHistory.length;
    const bins = new Array(24).fill(0);
    volHistory.forEach((v) => {
      const norm = (v - mean) / (Math.max(...volHistory) - Math.min(...volHistory) || 1) + 0.5;
      const idx = Math.min(23, Math.max(0, Math.floor(norm * 24)));
      bins[idx]++;
    });
    const maxBin = Math.max(...bins, 1);
    return bins.map((b) => (b / maxBin) * 90);
  }, [volHistory]);

  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong animate-rise">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent" />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              // FORECAST_MONITOR
            </div>
            <h2 className="mt-1 font-sans text-lg font-semibold tracking-tight text-white">
              Price <span className="text-muted-foreground">vs</span>{" "}
              <span className="text-cyan-glow">Implied Volatility</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/70" /> Price
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "oklch(0.85 0.17 85)" }}
              />{" "}
              Volatility
            </span>
            <span className="ml-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-cyan-glow">
              {priceHistory.length} pts
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          {/* Main chart */}
          <div className="relative h-[240px] overflow-hidden rounded-xl border border-white/10 bg-black/70 p-3">
            <div className="grid-bg absolute inset-0 opacity-50" />
            {!hasData ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Waiting for data...
              </div>
            ) : (
              <div className="absolute inset-0 z-10 h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.85 0.17 85)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="oklch(0.85 0.17 85)" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {/* Tooltip config */}
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "rgba(255,255,255,0.15)",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                      isAnimationActive={false}
                    />

                    {/* Dual axes for price and volatility to scale them correctly */}
                    <YAxis yAxisId="price" domain={["auto", "auto"]} hide />
                    <YAxis yAxisId="vol" domain={["auto", "auto"]} hide />

                    {/* Volatility Area */}
                    <Area
                      yAxisId="vol"
                      type="linear"
                      dataKey="vol"
                      stroke="oklch(0.85 0.17 85)"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#volFill)"
                      isAnimationActive={false}
                    />

                    {/* Champion Volatility Forecast (Muted dotted white line) */}
                    <Line
                      yAxisId="vol"
                      type="monotone"
                      dataKey="champForecast"
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      isAnimationActive={false}
                    />

                    {/* Challenger Volatility Forecast (Neon purple/violet glowing dotted line) */}
                    <Line
                      yAxisId="vol"
                      type="monotone"
                      dataKey="challForecast"
                      stroke="oklch(0.65 0.25 280)"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={false}
                      isAnimationActive={false}
                    />

                    {/* Price Line */}
                    <Line
                      yAxisId="price"
                      type="linear"
                      dataKey="price"
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "white",
                        stroke: "rgba(255,255,255,0.2)",
                        strokeWidth: 4,
                      }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {!hasData && (
              <div className="absolute right-4 top-4 rounded-md border border-white/10 bg-black/80 px-3 py-2 font-mono text-[10px]">
                <div className="text-muted-foreground">{new Date().toLocaleTimeString()}</div>
                <div className="text-white">
                  P{" "}
                  <span className="text-cyan-glow">{lastPrice ? lastPrice.toFixed(2) : "--"}</span>
                </div>
                <div className="text-white">
                  RV{" "}
                  <span className="text-violet-glow">
                    {lastVol ? (lastVol * 100).toFixed(2) + "%" : "--"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Residual histogram */}
          <div className="relative flex h-[240px] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-black/70 p-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Residual Distribution
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-xl font-semibold text-white">
                  n={volHistory.length}
                </span>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex h-[140px] items-end gap-[3px]">
                {residuals.map((h, i) => {
                  const center = Math.abs(i - 12) < 3;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-all duration-300 ${center ? "bg-violet-glow/70" : "bg-cyan-glow/35"}`}
                      style={{ height: `${Math.max(2, h)}%` }}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                <span>-3 sigma</span>
                <span>0</span>
                <span>+3 sigma</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
