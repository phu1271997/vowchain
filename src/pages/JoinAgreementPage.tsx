import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Coins, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../lib/walletContext";
import { getAgreement, joinAgreement } from "../lib/contractApi";
import { addToHistory } from "../lib/agreementHistory";
import type { Agreement } from "../lib/types";
import { ConsensusProgress } from "../components/ConsensusProgress";

export const JoinAgreementPage: React.FC = () => {
  const { account, rawAccount } = useWallet();
  const navigate = useNavigate();

  const [agreementId, setAgreementId] = useState("");
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [deposit, setDeposit] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementId.trim()) return;
    setLoading(true);
    setError(null);
    setAgreement(null);
    try {
      const res = await getAgreement(agreementId);
      if (res.status !== "CREATED") {
        setError(`Agreement is currently in status: ${res.status}. Only pending agreements in CREATED status can be joined.`);
      } else {
        setAgreement(res);
      }
    } catch (err: any) {
      console.error(err);
      setError("Agreement not found. Please verify the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !agreement) return;

    // Verify user is Partner B
    if (account.toLowerCase() !== agreement.partner_b.toLowerCase()) {
      setError(`Warning: Your active address (${account}) does not match the registered Partner B address (${agreement.partner_b}) in this pre-marriage draft.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const depositWei = deposit ? BigInt(deposit) : 0n;
      await joinAgreement(rawAccount, agreement.agreement_id, depositWei, setProgressMsg);
      addToHistory(agreement.agreement_id, "partner_b");
      setSuccess(true);
      setTimeout(() => {
        navigate(`/agreement/${agreement.agreement_id}`);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to join agreement. Ensure transaction parameters are correct.");
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (wei: bigint) => {
    const gen = Number(wei) / 1e18;
    return `${gen.toFixed(2)} GEN`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <div className="border-b border-[var(--border-color)] pb-4 mb-8 text-left">
        <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
          <Users className="text-[var(--accent-purple)]" size={26} />
          Join Partner Agreement
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Enter an Agreement ID shared by your partner to verify terms and complete the joint deposit.
        </p>
      </div>

      {error && (
        <div className="alert alert-warning mb-6">
          <AlertTriangle size={18} />
          <span className="text-xs text-left leading-relaxed">{error}</span>
        </div>
      )}

      {loading && <ConsensusProgress message={progressMsg} />}

      {!loading && !success && (
        <div className="flex flex-col gap-6">
          {/* Search Bar */}
          {!agreement && (
            <form onSubmit={handleSearch} className="card border border-[var(--border-color)] p-6 text-left flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <Search size={14} className="text-[var(--accent-purple)]" />
                  Search Agreement ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter ID (e.g. 1, 2, 3)"
                    value={agreementId}
                    onChange={(e) => setAgreementId(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!agreementId}
                    className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Draft Preview & Deposit form */}
          {agreement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
              <div className="card border border-[var(--border-color)] p-6 text-left flex flex-col gap-5 bg-[var(--bg-secondary)]/80">
                <h3 className="font-heading font-bold text-white text-base">
                  Vow Draft Details #{agreement.agreement_id}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-3 flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Partner A (Initiator)</span>
                    <span className="text-white font-mono truncate">{agreement.partner_a}</span>
                    <span className="text-emerald-400 font-bold mt-1">Funded: {formatBalance(agreement.deposit_a)}</span>
                  </div>

                  <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-3 flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Partner B (You)</span>
                    <span className="text-white font-mono truncate">{agreement.partner_b}</span>
                    <span className="text-zinc-500 font-bold mt-1">Pending setup...</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Vow & Separation Rules</span>
                  <div className="bg-black/40 border border-[var(--border-color)] rounded-xl p-4 text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                    "{agreement.terms}"
                  </div>
                </div>

                <form onSubmit={handleJoin} className="flex flex-col gap-4 border-t border-[var(--border-color)] pt-5 mt-2">
                  <div className="form-group">
                    <label className="form-label flex items-center gap-1.5">
                      <Coins size={14} className="text-[var(--accent-cyan)]" />
                      Your Initial Deposit amount (Wei)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="form-input font-mono"
                    />
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      (1 GEN = 10^18 Wei). This deposit will form the joint asset pool.
                    </span>
                  </div>

                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setAgreement(null)}
                      className="bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-white font-bold px-6 py-3 rounded-xl"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold px-8 py-3 rounded-xl hover:opacity-95 shadow-[0_4px_15px_rgba(183,110,121,0.2)]"
                    >
                      <span>Join & Activate Vow</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {success && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card border border-emerald-500/20 bg-emerald-500/5 p-8 text-center flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-white">Vow Successfully Activated!</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              You have successfully joined the agreement. Redirecting to your Vow dashboard...
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
