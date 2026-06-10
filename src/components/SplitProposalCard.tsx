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
    { name: partnerAName, value: proposal.proposed_split_a, color: "#b76e79" }, // Rose Gold
    { name: partnerBName, value: proposal.proposed_split_b, color: "#e2a76f" }, // Champagne Gold
  ];

  const isPartnerA = userAddress?.toLowerCase() === partnerAAddr.toLowerCase();
  const isPartnerB = userAddress?.toLowerCase() === partnerBAddr.toLowerCase();
  const isParticipant = isPartnerA || isPartnerB;

  const hasAccepted = isPartnerA ? proposal.accept_a : isPartnerB ? proposal.accept_b : false;

  return (
    <div className="card card-glow border border-[var(--accent-purple)]/20 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-white">
          <Scale className="text-[var(--accent-purple)]" size={20} />
          Arbitration Consensus Proposed Split
        </h3>
        <span className="text-xs font-mono bg-[rgba(226,167,111,0.1)] text-[#e2a76f] border border-[#e2a76f]/30 px-2.5 py-1 rounded-md">
          Confidence: {proposal.reasoning.confidence || "Medium"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Pie Chart */}
        <div className="w-full lg:w-2/5 h-[180px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-heading font-extrabold text-white">
              {proposal.proposed_split_a}:{proposal.proposed_split_b}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
              Split Ratio
            </span>
          </div>
        </div>

        {/* Labels & Details */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
                {partnerAName} Share
              </span>
              <span className="text-xl font-heading font-bold text-[#b76e79] mt-1">
                {proposal.proposed_split_a}%
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)] font-mono truncate">
                {partnerAAddr}
              </span>
            </div>
            <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
                {partnerBName} Share
              </span>
              <span className="text-xl font-heading font-bold text-[#e2a76f] mt-1">
                {proposal.proposed_split_b}%
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)] font-mono truncate">
                {partnerBAddr}
              </span>
            </div>
          </div>

          {/* Interactive Signoff status */}
          <div className="bg-[rgba(183,110,121,0.05)] border border-[var(--border-color)] rounded-xl p-3.5 flex justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${proposal.accept_a ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
              />
              <span className="text-[var(--color-text-secondary)] font-semibold">
                {partnerAName}: {proposal.accept_a ? "Signed" : "Pending Sign-off"}
              </span>
            </div>
            <div className="h-4 w-px bg-[var(--border-color)]" />
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${proposal.accept_b ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
              />
              <span className="text-[var(--color-text-secondary)] font-semibold">
                {partnerBName}: {proposal.accept_b ? "Signed" : "Pending Sign-off"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Factors and Reasoning details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
            Factors Considered
          </span>
          <div className="bg-black/30 border border-[var(--border-color)] rounded-xl p-3.5 text-xs text-[var(--color-text-secondary)] leading-relaxed h-[110px] overflow-y-auto">
            {proposal.reasoning.factors_considered || "No specific factors indexed by AI judges."}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
            AI Judges' Consolidated Verdict
          </span>
          <div className="bg-black/30 border border-[var(--border-color)] rounded-xl p-3.5 text-xs text-[var(--color-text-secondary)] leading-relaxed h-[110px] overflow-y-auto">
            {proposal.reasoning.reasoning || proposal.reasoning.raw_reasoning || "No reasoning text found."}
          </div>
        </div>
      </div>

      {/* Controls */}
      {isParticipant && (
        <div className="flex flex-col sm:flex-row gap-3 border-t border-[var(--border-color)] pt-5 mt-2">
          {hasAccepted ? (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
              <HeartHandshake size={18} />
              <span>You have signed this proposal. Waiting for partner signature...</span>
            </div>
          ) : (
            <>
              <button
                onClick={onAccept}
                disabled={loading}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_15px_rgba(183,110,121,0.2)] disabled:opacity-50"
              >
                <FileSignature size={18} />
                <span>Accept & Sign Split</span>
              </button>
              <button
                onClick={onDispute}
                disabled={loading}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-transparent hover:bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                <ShieldAlert size={18} />
                <span>Dispute Split Verdict</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
