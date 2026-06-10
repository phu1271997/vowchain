import React from "react";
import { Check } from "lucide-react";

interface TimelineProps {
  currentStatus: string;
}

export const Timeline: React.FC<TimelineProps> = ({ currentStatus }) => {
  const steps = [
    { key: "CREATED", label: "Drafted", desc: "Prenup initiated by Partner A" },
    { key: "ACTIVE", label: "Signed & Active", desc: "Partner B joined, assets deposited" },
    { key: "DISSOLVING", label: "Dissolution", desc: "Dissolution declared, evidence open" },
    { key: "PROPOSED", label: "Arbitrated Split", desc: "AI validator consensus split computed" },
    { key: "SETTLED", label: "Funds Settled", desc: "Mutual signatures, deposits released" },
  ];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ARBITRATING") return 3; // Intermediate step
    if (s === "DEADLOCK") return 4; // Alternative path
    
    const idx = steps.findIndex((step) => step.key === s);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 w-full py-4">
      {/* Connector lines behind steps (hidden on mobile, inline vertical lines used instead) */}
      <div className="absolute top-[26px] left-8 right-8 h-0.5 bg-[var(--border-color)] z-0 hidden md:block" />
      <div 
        className="absolute top-[26px] left-8 h-0.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] z-0 hidden md:block transition-all duration-500" 
        style={{ width: `${(currentIndex / (steps.length - 1)) * 90}%` }}
      />

      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex || currentStatus.toUpperCase() === "SETTLED";
        const isActive = idx === currentIndex && currentStatus.toUpperCase() !== "SETTLED";
        
        return (
          <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 w-full md:w-1/5 relative">
            {/* Step bubble */}
            <div
              className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold text-sm ${
                isCompleted
                  ? "bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] border-transparent text-white shadow-[0_0_15px_rgba(183,110,121,0.4)]"
                  : isActive
                  ? "bg-[var(--bg-primary)] border-[var(--accent-pink)] text-[var(--accent-pink)] shadow-[0_0_15px_rgba(255,158,187,0.2)] animate-pulse"
                  : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--color-text-muted)]"
              }`}
            >
              {isCompleted ? <Check size={18} /> : <span>{idx + 1}</span>}
            </div>

            {/* Step label & desc */}
            <div className="flex flex-col md:items-center text-left md:text-center">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isActive
                    ? "text-[var(--accent-pink)]"
                    : isCompleted
                    ? "text-[var(--accent-purple)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 max-w-[130px] hidden md:block">
                {step.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
