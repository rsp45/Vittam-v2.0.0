import { useState, useEffect } from "react";
import { Loader2, Code, Shield, Play } from "lucide-react";

const defaultChampion = `# GarchBaseline Baseline
import numpy as np

class GarchBaseline:
    def __init__(self, alpha=0.94, lam=0.06):
        self.alpha = alpha
        self.lam = lam

    def fit(self, values: list[float]) -> None:
        # Fit rolling realized volatility window levels
        self.level = sum(values[-10:]) / 10.0

    def predict(self, horizon: int) -> list[float]:
        # Return rolling forecast continuity
        return [self.level for _ in range(horizon)]`;

const defaultChallenger = `# AI Challenger Model (Autocreated)
No challenger generated yet. 
Try clicking "Generate Challenger" or "Trigger Nexus Engine" to compile a real-time adaptive model.`;

function highlight(code: string) {
  const kw = /\b(class|def|import|from|return|self|for|in|if|else|None|True|False)\b/g;
  const str = /(\".*?\"|\'.*?\'|#[^\n]*)/g;
  const num = /\b(\d+\.?\d*)\b/g;
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(str, (m) => `<span class="text-amber-glow/90 font-medium">${m}</span>`)
    .replace(kw, (m) => `<span class="text-violet-glow font-bold">${m}</span>`)
    .replace(num, (m) => `<span class="text-cyan-glow font-bold">${m}</span>`);
}

function Editor({
  title,
  code,
  tag,
  tone,
  isLoading = false,
  isEditable = false,
  onRunSandbox,
  onCodeChange,
}: {
  title: string;
  code: string;
  tag: string;
  tone: "cyan" | "violet";
  isLoading?: boolean;
  isEditable?: boolean;
  onRunSandbox?: (edited: string) => void;
  onCodeChange?: (edited: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localCode, setLocalCode] = useState(code);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const codeToShow = isLoading
    ? `class VolatilityModelCompiler:
    # Compiling custom AI Challenger...
    # Formulating scientific hypothesis...
    # Running AST verification sandbox...
    # Executing walk-forward simulations...`
    : localCode;

  const html = { __html: highlight(codeToShow) };
  const lines = codeToShow.split("\n").length;
  const accent = tone === "violet" ? "text-violet-glow" : "text-cyan-glow";

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-card flex flex-col min-h-[300px] shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Premium IDE Header Tabs */}
      <div className="flex items-center justify-between border-b bg-secondary/30 px-4 py-2 select-none">
        <div className="flex items-center gap-2">
          {tone === "violet" ? (
            <Shield className="h-3.5 w-3.5 text-violet-glow animate-pulse" />
          ) : (
            <Code className="h-3.5 w-3.5 text-cyan-glow" />
          )}
          <span className="font-mono text-[11px] font-semibold text-foreground/80">{title}</span>
          <span className="h-2 w-2 rounded-full bg-border" />
        </div>
        <div className="flex items-center gap-2">
          {isEditable && !isLoading && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider bg-secondary border hover:text-foreground text-muted-foreground transition"
            >
              {isEditing ? "View Mode" : "✎ Manual Edit"}
            </button>
          )}
          <span
            className={`rounded-full border bg-background px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider ${accent}`}
          >
            {tag}
          </span>
        </div>
      </div>
      
      {/* Code Area */}
      <div className="grid grid-cols-[45px_1fr] flex-1 font-mono text-[11.5px] leading-6 bg-card">
        <div className="select-none border-r bg-secondary/15 py-4 text-right pr-3 font-mono text-[10px] text-muted-foreground/50">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative overflow-auto custom-scroll flex flex-col">
          {isEditing ? (
            <textarea
              value={localCode}
              onChange={(e) => {
                setLocalCode(e.target.value);
                onCodeChange?.(e.target.value);
              }}
              className="w-full flex-1 min-h-[250px] p-4 bg-transparent border-0 font-mono text-[11.5px] leading-6 text-foreground/90 focus:outline-none focus:ring-0 custom-scroll resize-none"
              spellCheck={false}
            />
          ) : (
            <pre className="py-4 pl-4 pr-3 text-foreground/90 font-mono">
              <code dangerouslySetInnerHTML={html} />
            </pre>
          )}
          
          {isEditing && (
            <div className="p-3 border-t bg-secondary/10 flex justify-end">
              <button
                onClick={() => onRunSandbox?.(localCode)}
                className="flex items-center gap-1.5 rounded bg-violet-glow text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 hover:brightness-110 shadow-[0_2px_8px_var(--violet-glow)] transition"
              >
                <Play className="h-3 w-3" /> Run Sandbox
              </button>
            </div>
          )}
          
          {/* Glowing Compile Backdrop */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-md z-20 animate-fade-in">
              <Loader2 className="h-9 w-9 animate-spin text-violet-glow" />
              <span className="mt-3.5 font-mono text-[10px] text-violet-glow font-bold uppercase tracking-widest animate-pulse">Compiling model...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SynthesisLabProps {
  championCode?: string;
  challengerCode?: string;
  isGenerating?: boolean;
  onResynth?: () => void;
  onRunCustomSandbox?: (code: string) => void;
}

export function SynthesisLab({
  championCode = defaultChampion,
  challengerCode = defaultChallenger,
  isGenerating = false,
  onResynth,
  onRunCustomSandbox,
}: SynthesisLabProps) {
  const [editedCode, setEditedCode] = useState(challengerCode);

  useEffect(() => {
    setEditedCode(challengerCode);
  }, [challengerCode]);

  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong animate-rise">
      <div className="p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              // AGENTIC_COMPILER_LAB
            </div>
            <h2 className="mt-1 font-sans text-xl font-bold tracking-tight text-foreground">
              Champion Model <span className="text-muted-foreground font-normal">vs</span>{" "}
              <span className="text-violet-glow font-extrabold">AI Challenger</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border bg-secondary/60 px-3 py-1 font-mono text-[10px] text-muted-foreground font-semibold">
              GEN <span className="text-violet-glow font-bold">{challengerCode !== defaultChallenger ? "v2.1" : "NONE"}</span>
            </span>
            <button
              onClick={onResynth}
              disabled={isGenerating}
              className="rounded-lg border border-violet-glow/40 bg-violet-glow/10 px-3.5 py-1.5 font-mono text-[10px] font-bold text-violet-glow hover:bg-violet-glow/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ⌁ Resynth
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Editor title="champion_baseline.py" code={championCode} tag="Champion · live" tone="cyan" />
          <Editor
            title="challenger_v2138.py"
            code={editedCode}
            tag="AI Challenger · compiled"
            tone="violet"
            isLoading={isGenerating}
            isEditable={true}
            onCodeChange={setEditedCode}
            onRunSandbox={onRunCustomSandbox}
          />
        </div>
      </div>
    </section>
  );
}
