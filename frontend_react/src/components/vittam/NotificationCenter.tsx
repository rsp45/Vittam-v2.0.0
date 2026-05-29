import React, { useState } from "react";
import { useNotifications, Severity, NotificationItem } from "./NotificationContext";
import { AlertTriangle, CheckCircle, Info, ShieldCheck, X, Settings, Volume2, VolumeX, Radio, Bell, Trash2 } from "lucide-react";

const severityMap: Record<
  Severity,
  { icon: any; color: string; border: string; bg: string; emoji: string }
> = {
  CRITICAL: {
    icon: AlertTriangle,
    color: "text-red-500",
    border: "border-red-500/30 border-l-[4px] border-l-red-500",
    bg: "bg-red-500/5",
    emoji: "🚨",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-500",
    border: "border-amber-500/30 border-l-[4px] border-l-amber-500",
    bg: "bg-amber-500/5",
    emoji: "⚠️",
  },
  SUCCESS: {
    icon: CheckCircle,
    color: "text-emerald-500",
    border: "border-emerald-500/30 border-l-[4px] border-l-emerald-500",
    bg: "bg-emerald-500/5",
    emoji: "✅",
  },
  INFO: {
    icon: Info,
    color: "text-cyan-500",
    border: "border-cyan-500/30 border-l-[4px] border-l-cyan-500",
    bg: "bg-cyan-500/5",
    emoji: "ℹ️",
  },
};

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    preferences,
    toasts,
    isCenterOpen,
    isPreferencesOpen,
    criticalBanner,
    setCenterOpen,
    setPreferencesOpen,
    markRead,
    markAllRead,
    updatePreferences,
    dismissToast,
    dismissCriticalBanner,
    requestPushPermission,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"ALL" | Severity>("ALL");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    return n.severity === activeTab;
  });

  const handlePreferencesToggle = (key: keyof typeof preferences) => {
    if (key === "pushEnabled" && !preferences.pushEnabled) {
      requestPushPermission();
    }
    updatePreferences({ [key]: !preferences[key] });
  };

  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "some time ago";
    }
  };

  return (
    <>
      {/* ── 1. Critical Alert Banner (Top of Screen) ── */}
      {criticalBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 via-rose-700 to-red-600 py-3 px-6 shadow-xl flex items-center justify-between text-white border-b border-red-500/40 animate-slide-in">
          <div className="flex items-center gap-3.5 max-w-4xl">
            <span className="text-xl animate-pulse">🚨</span>
            <div className="leading-tight">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded font-bold">
                CRITICAL VOLATILITY EVENT
              </span>
              <p className="font-sans text-sm font-bold mt-1 text-white/95">
                {criticalBanner.title}: {criticalBanner.body}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-6 shrink-0">
            <button
              onClick={() => {
                setCenterOpen(true);
                markRead(criticalBanner.id);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-mono text-[10px] uppercase tracking-wider text-white border border-white/25 transition font-bold"
            >
              Analyze Threat
            </button>
            <button
              onClick={dismissCriticalBanner}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              aria-label="Dismiss Banner"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Active Toasts (Bottom-Right Stack) ── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-[380px] w-full pointer-events-none">
        {toasts.map((t) => {
          const s = severityMap[t.severity];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-xl border bg-card/90 backdrop-blur-md shadow-2xl p-4 flex gap-3 relative overflow-hidden transition-all duration-300 transform translate-x-0 ${s.border}`}
              style={{
                animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              <div className="shrink-0 text-lg leading-none mt-0.5">{s.emoji}</div>
              <div className="flex-1 pr-4 leading-tight">
                <h4 className="font-sans text-xs font-black text-foreground">{t.title}</h4>
                <p className="font-sans text-[11.5px] font-medium text-muted-foreground mt-1">
                  {t.body}
                </p>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Toast Dismiss Progress Bar (Manual dismiss CRITICAL does not show this) */}
              {t.severity !== "CRITICAL" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                  <div
                    className={`h-full transition-all duration-100 ${
                      t.severity === "SUCCESS"
                        ? "bg-emerald-500"
                        : t.severity === "WARNING"
                          ? "bg-amber-500"
                          : "bg-cyan-500"
                    }`}
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 3. Notification Center Slide-Out Panel ── */}
      {isCenterOpen && (
        <>
          {/* Panel Backdrop */}
          <div
            onClick={() => setCenterOpen(false)}
            className="fixed inset-0 z-45 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Panel Sheet */}
          <aside className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] z-50 bg-card/95 backdrop-blur-xl border-l flex flex-col transition-transform duration-500 shadow-2xl animate-in slide-in-from-right duration-400">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-cyan-glow" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-3 w-3 bg-red-500 rounded-full animate-pulse border border-card" />
                  )}
                </div>
                <div>
                  <h3 className="font-sans text-[15px] font-black text-foreground">Notification Hub</h3>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">
                    {unreadCount} unread messages
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreferencesOpen(true)}
                  className="p-2 rounded-lg hover:bg-secondary border text-muted-foreground hover:text-foreground transition cursor-pointer"
                  title="Configure Channels"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setCenterOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary border text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 border-b bg-secondary/20 flex gap-1 overflow-x-auto shrink-0 custom-scroll font-mono text-[9.5px] uppercase tracking-wider font-bold">
              {(["ALL", "CRITICAL", "WARNING", "SUCCESS", "INFO"] as const).map((tab) => {
                const count = tab === "ALL" 
                  ? notifications.length 
                  : notifications.filter(n => n.severity === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg border transition shrink-0 cursor-pointer ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scroll">
              {filteredNotifications.map((n) => {
                const s = severityMap[n.severity];
                const Icon = s.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`group rounded-xl border p-4.5 transition-all duration-300 hover:border-border/80 shadow-sm relative overflow-hidden flex gap-3 ${
                      s.border
                    } ${n.read ? "bg-card/40 opacity-70" : "bg-card hover:bg-secondary/10 cursor-pointer"}`}
                  >
                    {/* Read/Unread Status Dot */}
                    {!n.read && (
                      <span className="absolute top-4 right-4 h-2 w-2 bg-cyan-glow rounded-full animate-pulse border border-card" />
                    )}

                    <span className="text-lg leading-none shrink-0 mt-0.5">{s.emoji}</span>
                    <div className="flex-1 leading-normal pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[12.5px] font-black text-foreground">{n.title}</span>
                      </div>
                      <p className="font-sans text-[11.5px] font-semibold text-muted-foreground mt-1">
                        {n.body}
                      </p>
                      
                      {/* Metadata display if available */}
                      {n.metadata && Object.keys(n.metadata).length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-dashed border-border/40 font-mono text-[9px] text-muted-foreground/80 flex flex-wrap gap-x-3 gap-y-1">
                          {Object.entries(n.metadata).map(([k, v]) => (
                            <span key={k}>
                              <strong className="text-foreground/70">{k}:</strong> {String(v)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2.5 font-mono text-[8.5px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                        {getRelativeTime(n.created_at)} · {n.event_type}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredNotifications.length === 0 && (
                <div className="h-[250px] flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed rounded-2xl bg-secondary/15 py-12">
                  <Bell className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="font-sans text-xs font-bold uppercase tracking-wider">Clear Airspace</p>
                  <p className="font-sans text-[10.5px] mt-1 max-w-[200px] leading-relaxed">
                    No active notifications recorded in the {activeTab.toLowerCase()} alert log.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Control */}
            {notifications.some((n) => !n.read) && (
              <div className="p-4 border-t bg-secondary/10 shrink-0">
                <button
                  onClick={markAllRead}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-card border py-2.5 font-mono text-[10px] uppercase tracking-wider text-foreground hover:bg-secondary transition font-bold cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" /> Mark all as read
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* ── 4. Preferences Modal ── */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-400">
            {/* Design header glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-glow via-violet-glow to-amber-glow" />

            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-sans text-base font-black text-foreground">Alert Delivery Preferences</h3>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">
                  Configure real-time dispatch systems
                </span>
              </div>
              <button
                onClick={() => setPreferencesOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary border text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 font-sans text-xs">
              {/* Sound toggle */}
              <div className="flex items-center justify-between p-3.5 border rounded-xl bg-secondary/15 hover:bg-secondary/35 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg border bg-card shadow-sm text-foreground">
                    {preferences.soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-cyan-glow animate-pulse-soft" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground leading-tight">Audio Synthesis</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      Synthesize tones on alert arrival
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferencesToggle("soundEnabled")}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border shadow-inner ${
                    preferences.soundEnabled ? "bg-primary border-primary justify-end" : "bg-secondary justify-start"
                  }`}
                >
                  <span className="bg-card w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Native Push toggle */}
              <div className="flex items-center justify-between p-3.5 border rounded-xl bg-secondary/15 hover:bg-secondary/35 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg border bg-card shadow-sm text-foreground">
                    <Radio className="h-4 w-4 text-violet-glow" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground leading-tight">Browser Push Notifications</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      Dispatch native alerts in background
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferencesToggle("pushEnabled")}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border shadow-inner ${
                    preferences.pushEnabled ? "bg-primary border-primary justify-end" : "bg-secondary justify-start"
                  }`}
                >
                  <span className="bg-card w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Severity-based filters */}
              <div className="border rounded-xl p-4.5 bg-secondary/10 space-y-3.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold border-b pb-1 flex">
                  Severity Dispatch Channels
                </span>
                
                {/* 1. Critical */}
                <div className="flex justify-between items-center">
                  <span className="font-sans font-bold text-foreground">🚨 Critical Panic Dispatches</span>
                  <button
                    onClick={() => handlePreferencesToggle("showCritical")}
                    className={`w-8 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border shadow-inner ${
                      preferences.showCritical ? "bg-red-500 border-red-500 justify-end" : "bg-secondary justify-start"
                    }`}
                  >
                    <span className="bg-card w-3.5 h-3.5 rounded-full shadow-md" />
                  </button>
                </div>

                {/* 2. Warning */}
                <div className="flex justify-between items-center">
                  <span className="font-sans font-bold text-foreground">⚠️ Warning Anomaly Alerts</span>
                  <button
                    onClick={() => handlePreferencesToggle("showWarning")}
                    className={`w-8 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border shadow-inner ${
                      preferences.showWarning ? "bg-amber-500 border-amber-500 justify-end" : "bg-secondary justify-start"
                    }`}
                  >
                    <span className="bg-card w-3.5 h-3.5 rounded-full shadow-md" />
                  </button>
                </div>

                {/* 3. Success */}
                <div className="flex justify-between items-center">
                  <span className="font-sans font-bold text-foreground">✅ Promotion & Build Successes</span>
                  <button
                    onClick={() => handlePreferencesToggle("showSuccess")}
                    className={`w-8 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border shadow-inner ${
                      preferences.showSuccess ? "bg-emerald-500 border-emerald-500 justify-end" : "bg-secondary justify-start"
                    }`}
                  >
                    <span className="bg-card w-3.5 h-3.5 rounded-full shadow-md" />
                  </button>
                </div>

                {/* 4. Info */}
                <div className="flex justify-between items-center">
                  <span className="font-sans font-bold text-foreground">ℹ️ Informational Process Updates</span>
                  <button
                    onClick={() => handlePreferencesToggle("showInfo")}
                    className={`w-8 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border shadow-inner ${
                      preferences.showInfo ? "bg-cyan-500 border-cyan-500 justify-end" : "bg-secondary justify-start"
                    }`}
                  >
                    <span className="bg-card w-3.5 h-3.5 rounded-full shadow-md" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setPreferencesOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground font-bold hover:brightness-110 transition shadow-md cursor-pointer"
              >
                Save configurations
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
