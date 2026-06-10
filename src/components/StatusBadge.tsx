import React from "react";
import { Sparkles, Activity, Flame, FileSignature, ShieldAlert, Award } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusDetails = () => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <Activity size={13} className="animate-pulse" />,
          label: "Active Union",
        };
      case "DISSOLVING":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <Flame size={13} />,
          label: "Dissolution Declared",
        };
      case "ARBITRATING":
        return {
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          icon: <Sparkles size={13} className="animate-spin" style={{ animationDuration: "3s" }} />,
          label: "Deliberating Judges",
        };
      case "PROPOSED":
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          icon: <FileSignature size={13} />,
          label: "Split Proposed",
        };
      case "DEADLOCK":
        return {
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: <ShieldAlert size={13} />,
          label: "Consensus Deadlock",
        };
      case "SETTLED":
        return {
          bg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
          icon: <Award size={13} />,
          label: "Vow Settled",
        };
      default:
        return {
          bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
          icon: <Activity size={13} />,
          label: status,
        };
    }
  };

  const details = getStatusDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${details.bg} ${className}`}
    >
      {details.icon}
      <span>{details.label}</span>
    </span>
  );
};
