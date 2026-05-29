import { Link, useLocation } from "@tanstack/react-router";
import { Activity, Cpu, Zap, Loader2, Sun, Moon, Bell } from "lucide-react";
import { useNotifications } from "./NotificationContext";

interface TopbarProps {
  onGenerateChallenger?: () => void;
  onTriggerRuFlo?: () => void;
  isGenerating?: boolean;
  isOrchestrating?: boolean;
  connected?: boolean;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  activeSymbol?: string;
  onSymbolChange?: (symbol: string) => void;
}

export function Topbar({
  onGenerateChallenger,
  onTriggerRuFlo,
  isGenerating = false,
  isOrchestrating = false,
  connected = true,
  theme = "dark",
  onToggleTheme,
  activeSymbol = "BTCUSDT",
  onSymbolChange,
}: TopbarProps) {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const { unreadCount, setCenterOpen } = useNotifications();

  return (
    <header className="sticky top-0 z-40 glass-strong border-b">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-cyan-glow/20 to-violet-glow/10 border border-border">
              <Cpu className="h-4 w-4 text-cyan-glow animate-flicker" />
              <span className="absolute -inset-px rounded-md ring-1 ring-cyan-glow/20" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-[15px] font-semibold tracking-wider text-foreground">
                VITTAM <span className="text-cyan-glow">2.0</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Dynamic Volatility Regime Modeler
              </div>
            </div>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {[
              { to: "/dashboard", label: "Control Room" },
              { to: "/legacy", label: "Vittam 1.0" },
              { to: "/learn", label: "Learn" },
              { to: "/", label: "Overview" },
            ].map((i) => (
              <Link
                key={i.to}
                to={i.to}
                activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                className="rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition hover:text-foreground hover:bg-secondary/40"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3" id="tour-primary-controls">
          {/* Ticker Dropdown Selector */}
          {isDashboard && (
            <div className="flex items-center gap-1.5 rounded-md border bg-secondary/50 px-2.5 py-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground pl-1">Symbol:</span>
              <select
                value={activeSymbol}
                onChange={(e) => onSymbolChange?.(e.target.value)}
                className="bg-transparent border-0 font-mono text-[10px] uppercase tracking-wider text-cyan-glow focus:outline-none focus:ring-0 pr-6 pl-1 py-0.5 cursor-pointer font-bold select-custom"
              >
                <option value="BTCUSDT" className="bg-background text-foreground">BTC/USDT</option>
                <option value="ETHUSDT" className="bg-background text-foreground">ETH/USDT</option>
                <option value="SOLUSDT" className="bg-background text-foreground">SOL/USDT</option>
              </select>
            </div>
          )}

          {/* Ingest Status */}
          {isDashboard && (
            <div className="hidden items-center gap-2 rounded-md border bg-secondary/50 px-3 py-1.5 md:flex">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-pulse-soft rounded-full opacity-75 ${connected ? "bg-cyan-glow" : "bg-crimson-glow"}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-cyan-glow" : "bg-crimson-glow"}`} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Feed <span className={connected ? "text-cyan-glow font-semibold" : "text-crimson-glow font-semibold"}>{connected ? "LIVE" : "OFFLINE"}</span> · 84ms
              </span>
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="rounded-md border p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-glow" />
            ) : (
              <Moon className="h-4 w-4 text-violet-glow" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setCenterOpen(true)}
            aria-label="Notifications"
            className="relative rounded-md border p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition cursor-pointer"
          >
            <Bell className="h-4 w-4 text-cyan-glow" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-mono text-[8px] font-bold text-white animate-bounce border border-card shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Action buttons */}
          {isDashboard && (
            <>
              <button
                onClick={onGenerateChallenger}
                disabled={isGenerating}
                className="group inline-flex items-center gap-2 rounded-md border bg-secondary/80 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-glow" />
                ) : (
                  <Activity className="h-3.5 w-3.5 text-violet-glow" />
                )}
                {isGenerating ? "Generating..." : "Generate Challenger"}
              </button>
              <button
                onClick={onTriggerRuFlo}
                disabled={isOrchestrating}
                className="group relative inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-primary-foreground shadow-[0_4px_12px_-4px_var(--cyan-glow)] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOrchestrating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                {isOrchestrating ? "Running..." : "Trigger Nexus Engine"}
                <span className="ml-1 rounded-sm bg-primary-foreground/20 px-1 py-0.5 text-[9px]">⌘R</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
