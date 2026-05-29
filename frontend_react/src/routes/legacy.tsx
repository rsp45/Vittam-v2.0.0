import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/vittam/Topbar";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/legacy")({
  component: LegacyDashboard,
});

function LegacyDashboard() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Topbar theme={theme} onToggleTheme={toggleTheme} />
      
      <div className="flex-1 w-full bg-background relative">
        <div className="absolute top-0 left-0 w-full h-full bg-secondary/5 z-0 flex items-center justify-center pointer-events-none">
          <div className="animate-pulse flex flex-col items-center opacity-30">
            <div className="w-8 h-8 border-4 border-violet-glow border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="font-mono text-[10px] tracking-widest uppercase">Initializing Legacy Engine...</span>
          </div>
        </div>
        <iframe
          src="/v1/legacy/"
          className="w-full h-full border-none relative z-10"
          title="Vittam 1.0 Legacy Dashboard"
        />
      </div>
    </div>
  );
}
