import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronRight, Check } from "lucide-react";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

interface ProductTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export function ProductTour({ steps, isActive, onComplete, onClose }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (!isActive || currentStep >= steps.length) return;
    
    const step = steps[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      // Add a little padding around the element
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top - 12,
        left: rect.left - 12,
        right: rect.right + 12,
        bottom: rect.bottom + 12,
        width: rect.width + 24,
        height: rect.height + 24,
        x: rect.x - 12,
        y: rect.y - 12,
        toJSON: () => {}
      });
      // smooth scroll into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });
    
    // Check periodically in case DOM changes slightly
    const interval = setInterval(updateRect, 500);
    
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      clearInterval(interval);
    };
  }, [updateRect]);

  // Reset step when activated
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;

  // Calculate tooltip placement (prefer bottom, then top, then right)
  let tooltipStyle: React.CSSProperties = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  if (targetRect) {
    const spaceBelow = windowHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    if (spaceBelow > 200) {
      tooltipStyle = { top: targetRect.bottom + 20, left: Math.max(20, targetRect.left) };
    } else if (spaceAbove > 200) {
      tooltipStyle = { bottom: windowHeight - targetRect.top + 20, left: Math.max(20, targetRect.left) };
    } else {
      tooltipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* 4 Blockers to create a "hole" */}
      {targetRect && (
        <>
          <div 
            className="absolute bg-black/60 backdrop-blur-md pointer-events-auto transition-all duration-500 ease-in-out"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, targetRect.top) }} 
          />
          <div 
            className="absolute bg-black/60 backdrop-blur-md pointer-events-auto transition-all duration-500 ease-in-out"
            style={{ top: Math.max(0, targetRect.bottom), left: 0, right: 0, bottom: 0 }} 
          />
          <div 
            className="absolute bg-black/60 backdrop-blur-md pointer-events-auto transition-all duration-500 ease-in-out"
            style={{ top: Math.max(0, targetRect.top), bottom: windowHeight - Math.max(0, targetRect.bottom), left: 0, width: Math.max(0, targetRect.left) }} 
          />
          <div 
            className="absolute bg-black/60 backdrop-blur-md pointer-events-auto transition-all duration-500 ease-in-out"
            style={{ top: Math.max(0, targetRect.top), bottom: windowHeight - Math.max(0, targetRect.bottom), left: Math.max(0, targetRect.right), right: 0 }} 
          />
          
          {/* Highlight ring around the hole */}
          <div 
            className="absolute pointer-events-none border-2 border-cyan-glow rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-500 ease-in-out"
            style={{ 
              top: targetRect.top, 
              left: targetRect.left, 
              width: targetRect.width, 
              height: targetRect.height 
            }}
          />
        </>
      )}

      {/* Tooltip */}
      <div 
        className="absolute w-[340px] p-5 glass-strong border border-cyan-glow/40 rounded-xl shadow-2xl pointer-events-auto transition-all duration-500 ease-in-out animate-in fade-in zoom-in-95"
        style={tooltipStyle}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-wider text-cyan-glow font-semibold">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-glow/20 border border-cyan-glow/40">
            {currentStep + 1}
          </span>
          Tour Step {currentStep + 1} of {steps.length}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
          {step.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed font-medium">
          {step.description}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={"w-1.5 h-1.5 rounded-full transition-all duration-300 " + (idx === currentStep ? "bg-cyan-glow w-3" : "bg-primary/20")}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="group flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-md text-xs font-mono uppercase tracking-wider text-foreground transition-all shadow-lg hover:shadow-cyan-glow/20"
          >
            {isLastStep ? (
              <>Got it <Check className="w-3.5 h-3.5 text-cyan-glow" /></>
            ) : (
              <>Next <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
