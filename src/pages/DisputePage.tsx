import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Clock, Award, Info } from "lucide-react";
import { motion } from "framer-motion";
import { getAgreement } from "../lib/contractApi";
import type { Agreement } from "../lib/types";

export const DisputePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgreementData = async () => {
      if (!id) return;
      try {
        const res = await getAgreement(id);
        setAgreement(res);
      } catch (err) {
        console.error("Failed to load agreement details for dispute info", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreementData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Clock className="animate-spin text-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-left"
    >
      <div className="card border border-rose-500/25 bg-rose-500/[0.04] p-8 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500/50 to-transparent" />

        <div className="flex items-start gap-3 text-rose-400">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">
              Dispute registered
            </h2>
            <p className="text-xs text-rose-300/80 mt-0.5 font-mono">Agreement #{id}</p>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          The split proposal was disputed. In accordance with the vow's smart contract parameters, the agreement has reverted to the <span className="text-white font-bold">DISSOLVING</span> status. Both partners may now access the evidence panel to review claims and submit revised evidence before running the arbitration process again.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Cooldown Info */}
          <div className="bg-black/40 border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--accent-cyan)]" />
              Dispute Cooldown
            </span>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-1">
              A strict <span className="text-white font-bold">24-hour cooldown</span> is now active. No further split proposals can be generated or disputed until this period expires. This ensures partners take time for sober reflection.
            </p>
          </div>

          {/* Reputation Penalty Info */}
          <div className="bg-black/40 border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide flex items-center gap-1.5">
              <Award size={14} className="text-rose-400" />
              Reputation Deduction
            </span>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-1">
              Filing a dispute incurs a <span className="text-rose-400 font-bold">-1 reputation point</span> penalty on the disputing partner. Reputation affects future trust tier ratings across the GenLayer network.
            </p>
          </div>
        </div>

        {agreement && (
          <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-4 text-xs flex justify-between">
            <span className="text-[var(--color-text-muted)]">Active Dispute Count:</span>
            <span className="text-white font-bold">{agreement.dispute_count} / 3 Attempts</span>
          </div>
        )}

        <div className="bg-[rgba(226,167,111,0.05)] border border-[var(--border-color)] rounded-xl p-4 flex gap-2.5 items-start">
          <Info size={16} className="text-[#e2a76f] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-normal">
            Note: If the split is disputed 3 times, the agreement transitions permanently into a <span className="text-white font-bold">DEADLOCK</span> state. In DEADLOCK, assets are locked until partners mutually agree to dissolve the deadlock via an equal 50/50 division.
          </p>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6 flex justify-start">
          <button
            onClick={() => navigate(`/agreement/${id}`)}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            <span>Return to Vow Dashboard</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
