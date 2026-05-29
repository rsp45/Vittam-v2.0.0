import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, CheckCircle, Info, ShieldCheck, Volume2, VolumeX, Bell, Settings, X, Trash2 } from "lucide-react";

export type Severity = "CRITICAL" | "WARNING" | "SUCCESS" | "INFO";

export interface NotificationItem {
  id: string;
  event_type: string;
  severity: Severity;
  title: string;
  body: string;
  metadata: Record<string, any>;
  created_at: string;
  read: boolean;
}

export interface ToastItem {
  id: string;
  notificationId: string;
  severity: Severity;
  title: string;
  body: string;
  progress: number;
}

interface Preferences {
  soundEnabled: boolean;
  pushEnabled: boolean;
  showInfo: boolean;
  showSuccess: boolean;
  showWarning: boolean;
  showCritical: boolean;
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: Preferences;
  toasts: ToastItem[];
  isCenterOpen: boolean;
  isPreferencesOpen: boolean;
  criticalBanner: NotificationItem | null;
  setCenterOpen: (open: boolean) => void;
  setPreferencesOpen: (open: boolean) => void;
  toggleTheme: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  dismissToast: (id: string) => void;
  dismissCriticalBanner: () => void;
  emitNotification: (notification: any) => void;
  requestPushPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const defaultPrefs: Preferences = {
  soundEnabled: true,
  pushEnabled: true,
  showInfo: true,
  showSuccess: true,
  showWarning: true,
  showCritical: true,
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isCenterOpen, setCenterOpen] = useState(false);
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);
  const [criticalBanner, setCriticalBanner] = useState<NotificationItem | null>(null);

  const [preferences, setPreferences] = useState<Preferences>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vittam_notif_prefs");
      try {
        return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
      } catch {
        return defaultPrefs;
      }
    }
    return defaultPrefs;
  });

  // Sync preferences with localStorage
  const updatePreferences = useCallback((newPrefs: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...newPrefs };
      localStorage.setItem("vittam_notif_prefs", JSON.stringify(next));
      return next;
    });
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/v1/notifications?limit=100");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.items || []);
      setUnreadCount(data.unread_count || 0);

      // Check if there is an active unread critical notification to show in banner
      const activeCritical = (data.items || []).find(
        (n: NotificationItem) => n.severity === "CRITICAL" && !n.read
      );
      if (activeCritical) {
        setCriticalBanner(activeCritical);
      }
    } catch (err) {
      console.error("[VITTAM] Failed to load notification history:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Lazy dynamic tone generator (Web Audio API)
  const playSound = useCallback((severity: Severity) => {
    if (!preferences.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playBeep = (freq: number, duration: number, delay: number = 0) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, delay * 1000);
      };

      if (severity === "CRITICAL") {
        playBeep(880, 0.15, 0);
        playBeep(880, 0.15, 0.18);
        playBeep(880, 0.18, 0.36);
      } else if (severity === "WARNING") {
        playBeep(660, 0.18, 0);
        playBeep(660, 0.18, 0.22);
      } else if (severity === "SUCCESS") {
        playBeep(440, 0.10, 0);
        playBeep(880, 0.18, 0.10);
      } else if (severity === "INFO") {
        playBeep(523, 0.25, 0);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }, [preferences.soundEnabled]);

  // Request browser push permissions
  const requestPushPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  // Send native browser notification
  const sendBrowserPush = useCallback((item: NotificationItem) => {
    if (!preferences.pushEnabled) return;
    if (document.hasFocus()) return; // Don't push if user is focused on the page
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(item.title, {
          body: item.body,
          tag: item.event_type,
          requireInteraction: item.severity === "CRITICAL",
        });
      } catch (err) {
        console.error("Native push error:", err);
      }
    }
  }, [preferences.pushEnabled]);

  // Dismiss a toast from the active toasts list
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissCriticalBanner = useCallback(() => {
    if (criticalBanner) {
      markRead(criticalBanner.id);
      setCriticalBanner(null);
    }
  }, [criticalBanner]);

  // Local/Websocket Notification Receiver
  const emitNotification = useCallback((item: NotificationItem) => {
    // Check preferences filter
    if (item.severity === "INFO" && !preferences.showInfo) return;
    if (item.severity === "SUCCESS" && !preferences.showSuccess) return;
    if (item.severity === "WARNING" && !preferences.showWarning) return;
    if (item.severity === "CRITICAL" && !preferences.showCritical) return;

    // Add to state list
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === item.id);
      if (exists) return prev;
      const next = [item, ...prev];
      return next.slice(0, 100); // Keep max 100 history
    });

    setUnreadCount((c) => c + 1);

    // Audio tone
    playSound(item.severity);

    // Native Browser Push
    sendBrowserPush(item);

    // Critical Banner trigger
    if (item.severity === "CRITICAL") {
      setCriticalBanner(item);
    }

    // Add Toast element
    const toastId = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const next = [...prev, {
        id: toastId,
        notificationId: item.id,
        severity: item.severity,
        title: item.title,
        body: item.body,
        progress: 100,
      }];
      return next.slice(-5); // Maintain max 5 toasts on screen
    });

    // Auto-dismiss (CRITICAL has no auto-dismiss, needs user interaction)
    if (item.severity !== "CRITICAL") {
      const duration = item.severity === "WARNING" ? 8000 : 5000;
      const tick = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += tick;
        setToasts((prev) =>
          prev.map((t) => {
            if (t.id === toastId) {
              return { ...t, progress: Math.max(0, 100 - (elapsed / duration) * 100) };
            }
            return t;
          })
        );

        if (elapsed >= duration) {
          clearInterval(timer);
          dismissToast(toastId);
        }
      }, tick);
    }
  }, [preferences, playSound, sendBrowserPush, dismissToast]);

  // Mark Single Notification as Read
  const markRead = useCallback(async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (criticalBanner?.id === id) {
        setCriticalBanner(null);
      }

      await fetch(`/v1/notifications/${id}/read`, { method: "POST" });
    } catch (err) {
      console.error("Mark read API error:", err);
    }
  }, [criticalBanner]);

  // Mark All Notifications as Read
  const markAllRead = useCallback(async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setCriticalBanner(null);

      await fetch("/v1/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Mark all read API error:", err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
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
        emitNotification,
        requestPushPermission,
        toggleTheme: () => {},
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
