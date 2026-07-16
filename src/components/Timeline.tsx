import React from "react";
import { Check } from "lucide-react";

interface TimelineProps {
  currentStatus: string;
}

export const Timeline: React.FC<TimelineProps> = ({ currentStatus }) => {
  const steps = [
    { key: "CREATED", label: "Drafted", desc: "Prenup initiated by Partner A" },
    { key: "ACTIVE", label: "Active", desc: "Partner B joined, assets deposited" },
    { key: "DISSOLVING", label: "Dissolution", desc: "Evidence window open" },
    { key: "PROPOSED", label: "Arbitrated", desc: "AI consensus split proposed" },
    { key: "SETTLED", label: "Settled", desc: "Mutual signatures, funds released" },
  ];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ARBITRATING") return 3;
    if (s === "DEADLOCK") return 4;
    const idx = steps.findIndex((step) => step.key === s);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getStepIndex(currentStatus);
  const isSettled = currentStatus.toUpperCase() === "SETTLED";

  return (
    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-3 w-full py-2">
      <div className="absolute top-[22px] left-[8%] right-[8%] h-px bg-[var(--border-color)] z-0 hidden md:block" />
      <div
        className="absolute top-[22px] left-[8%] h-px bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] z-0 hidden md:block transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 84}%` }}
      />

      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex || isSettled;
        const isActive = idx === currentIndex && !isSettled;

        return (
          <div
            key={step.key}
            className="flex md:flex-col items-center gap-3.5 md:gap-2.5 z-10 w-full md:w-1/5 relative"
          >
            <div
              className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold text-sm shrink-0 ${
                isCompleted
                  ? "bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] border-transparent text-[#0c0a09] shadow-[0_0_16px_rgba(201,162,122,0.35)]"
                  : isActive
                  ? "bg-[var(--bg-primary)] border-[var(--accent-purple)] text-[var(--accent-purple)] shadow-[0_0_16px_rgba(201,162,122,0.2)]"
                  : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--color-text-muted)]"
              }`}
            >
              {isCompleted ? <Check size={18} strokeWidth={2.5} /> : <span>{idx + 1}</span>}
            </div>

            <div className="flex flex-col md:items-center text-left md:text-center">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isActive
                    ? "text-[var(--accent-purple)]"
                    : isCompleted
                    ? "text-white"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 max-w-[120px] hidden md:block leading-snug">
                {step.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
