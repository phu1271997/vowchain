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
    { label: "Canary Injection Guards Active", status: "passed" },
    { label: "GenLayer LLM Consensus Validators Spawned", status: "active" },
    { label: "Comparative Equivalence Logic Running", status: "pending" },
    { label: "Aggregating Final Split Multi-Sig", status: "pending" },
  ];

  return (
    <div className="card border border-[var(--accent-purple)]/30 bg-[rgba(18,7,12,0.9)] backdrop-blur-xl shadow-glow overflow-hidden relative p-6 mt-4 animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] animate-shimmer" />

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[var(--accent-purple)]/20 animate-ping" />
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] flex items-center justify-center text-white relative">
              <Cpu size={22} className="animate-pulse" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-lg leading-snug">
              On-Chain AI Arbitration Deliberation
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-mono">
              {message}
              {dots}
            </p>
          </div>
        </div>

        {/* Indeterminate loading bar */}
        <div className="w-full md:w-1/3 bg-black/40 h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
          <div className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] rounded-full animate-progress-indeterminate" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2 text-left">
            <div
              className={`h-2 w-2 rounded-full ${
                step.status === "passed"
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : step.status === "active"
                  ? "bg-[var(--accent-pink)] shadow-[0_0_8px_rgba(255,158,187,0.5)] animate-pulse"
                  : "bg-zinc-700"
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                step.status === "passed"
                  ? "text-emerald-400"
                  : step.status === "active"
                  ? "text-[var(--accent-pink)]"
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
