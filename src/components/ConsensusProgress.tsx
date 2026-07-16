import React, { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

interface ConsensusProgressProps {
  message: string;
}

export const ConsensusProgress: React.FC<ConsensusProgressProps> = ({ message }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "Canary guards", status: "passed" as const },
    { label: "LLM validators", status: "active" as const },
    { label: "Equivalence logic", status: "pending" as const },
    { label: "Aggregate split", status: "pending" as const },
  ];

  return (
    <div className="card card-glow border border-[var(--accent-purple)]/25 bg-[var(--bg-elevated)] shadow-glow overflow-hidden relative p-6 mt-4 animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-purple)] animate-shimmer bg-[length:200%_100%]" />

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[var(--accent-purple)]/20 animate-ping" />
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center text-[#0c0a09] relative shadow-[0_4px_16px_rgba(201,162,122,0.35)]">
              <Cpu size={22} className="animate-pulse" />
            </div>
          </div>
          <div className="text-left">
            <h4 className="text-white font-heading font-bold text-base sm:text-lg leading-snug">
              AI arbitration in progress
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-mono">
              {message}
              {dots}
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/3 bg-black/40 h-1.5 rounded-full overflow-hidden border border-[var(--border-color)]">
          <div className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] rounded-full animate-progress-indeterminate" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2 text-left">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                step.status === "passed"
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : step.status === "active"
                  ? "bg-[var(--accent-purple)] shadow-[0_0_8px_rgba(201,162,122,0.5)] animate-pulse"
                  : "bg-zinc-700"
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                step.status === "passed"
                  ? "text-emerald-400"
                  : step.status === "active"
                  ? "text-[var(--accent-purple)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
