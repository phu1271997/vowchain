import React from "react";
import { Sparkles, Activity, Flame, FileSignature, ShieldAlert, Award, FilePlus } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusDetails = () => {
    switch (status.toUpperCase()) {
      case "CREATED":
        return {
          bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
          icon: <FilePlus size={12} />,
          label: "Drafted",
        };
      case "ACTIVE":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <Activity size={12} className="animate-pulse" />,
          label: "Active Union",
        };
      case "DISSOLVING":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <Flame size={12} />,
          label: "Dissolution",
        };
      case "ARBITRATING":
        return {
          bg: "bg-[rgba(201,162,122,0.12)] text-[var(--accent-purple)] border-[rgba(201,162,122,0.3)]",
          icon: <Sparkles size={12} className="animate-spin" style={{ animationDuration: "3s" }} />,
          label: "Deliberating",
        };
      case "PROPOSED":
        return {
          bg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
          icon: <FileSignature size={12} />,
          label: "Split Proposed",
        };
      case "DEADLOCK":
        return {
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: <ShieldAlert size={12} />,
          label: "Deadlock",
        };
      case "SETTLED":
        return {
          bg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
          icon: <Award size={12} />,
          label: "Settled",
        };
      default:
        return {
          bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
          icon: <Activity size={12} />,
          label: status,
        };
    }
  };

  const details = getStatusDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${details.bg} ${className}`}
    >
      {details.icon}
      <span>{details.label}</span>
    </span>
  );
};
