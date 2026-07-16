import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Scale, HeartHandshake, ShieldAlert, FileSignature } from "lucide-react";
import type { Proposal } from "../lib/types";

interface SplitProposalCardProps {
  proposal: Proposal;
  partnerAName?: string;
  partnerBName?: string;
  partnerAAddr: string;
  partnerBAddr: string;
  onAccept: () => void;
  onDispute: () => void;
  loading: boolean;
  userAddress: string | null;
}

export const SplitProposalCard: React.FC<SplitProposalCardProps> = ({
  proposal,
  partnerAName = "Partner A",
  partnerBName = "Partner B",
  partnerAAddr,
  partnerBAddr,
  onAccept,
  onDispute,
  loading,
  userAddress,
}) => {
  const data = [
    { name: partnerAName, value: proposal.proposed_split_a, color: "#c9a27a" },
    { name: partnerBName, value: proposal.proposed_split_b, color: "#e8b4bc" },
  ];

  const isPartnerA = userAddress?.toLowerCase() === partnerAAddr.toLowerCase();
  const isPartnerB = userAddress?.toLowerCase() === partnerBAddr.toLowerCase();
  const isParticipant = isPartnerA || isPartnerB;
  const hasAccepted = isPartnerA ? proposal.accept_a : isPartnerB ? proposal.accept_b : false;

  return (
    <div className="card card-glow border border-[var(--accent-purple)]/20 p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <h3 className="font-heading font-bold text-base sm:text-lg flex items-center gap-2 text-white">
          <Scale className="text-[var(--accent-purple)]" size={20} />
          Consensus proposed split
        </h3>
        <span className="text-[11px] font-semibold bg-[rgba(201,162,122,0.1)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/25 px-2.5 py-1 rounded-md w-fit">
          Confidence: {proposal.reasoning.confidence || "Medium"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-2/5 h-[180px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-heading font-extrabold text-white tabular-nums">
              {proposal.proposed_split_a}:{proposal.proposed_split_b}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
              Split ratio
            </span>
          </div>
        </div>

        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="surface flex flex-col">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
                {partnerAName}
              </span>
              <span className="text-xl font-heading font-bold text-[var(--accent-purple)] mt-1 tabular-nums">
                {proposal.proposed_split_a}%
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)] font-mono truncate mt-0.5">
                {partnerAAddr}
              </span>
            </div>
            <div className="surface flex flex-col">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
                {partnerBName}
              </span>
              <span className="text-xl font-heading font-bold text-[var(--accent-pink)] mt-1 tabular-nums">
                {proposal.proposed_split_b}%
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)] font-mono truncate mt-0.5">
                {partnerBAddr}
              </span>
            </div>
          </div>

          <div className="bg-[rgba(201,162,122,0.05)] border border-[var(--border-color)] rounded-xl p-3.5 flex flex-col sm:flex-row sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  proposal.accept_a ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-[var(--color-text-secondary)] font-semibold">
                {partnerAName}: {proposal.accept_a ? "Signed" : "Pending"}
              </span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-[var(--border-color)]" />
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  proposal.accept_b ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-[var(--color-text-secondary)] font-semibold">
                {partnerBName}: {proposal.accept_b ? "Signed" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
            Factors considered
          </span>
          <div className="surface text-xs text-[var(--color-text-secondary)] leading-relaxed h-[110px] overflow-y-auto">
            {proposal.reasoning.factors_considered || "No specific factors indexed by AI judges."}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
            Judges' verdict
          </span>
          <div className="surface text-xs text-[var(--color-text-secondary)] leading-relaxed h-[110px] overflow-y-auto">
            {proposal.reasoning.reasoning ||
              proposal.reasoning.raw_reasoning ||
              "No reasoning text found."}
          </div>
        </div>
      </div>

      {isParticipant && (
        <div className="flex flex-col sm:flex-row gap-3 border-t border-[var(--border-color)] pt-5">
          {hasAccepted ? (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
              <HeartHandshake size={18} />
              <span>Signed — waiting for partner</span>
            </div>
          ) : (
            <>
              <button onClick={onAccept} disabled={loading} className="btn btn-primary flex-1 py-3.5">
                <FileSignature size={18} />
                Accept & sign split
              </button>
              <button onClick={onDispute} disabled={loading} className="btn btn-danger flex-1 py-3.5">
                <ShieldAlert size={18} />
                Dispute verdict
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
