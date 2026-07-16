import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Scale, Shield, Sparkles, Plus, ArrowRight, History, Trash2, Award } from "lucide-react";
import { motion } from "framer-motion";
import { getLocalHistory, removeFromHistory } from "../lib/agreementHistory";
import { getAgreement } from "../lib/contractApi";
import type { LocalHistoryItem } from "../lib/types";

export const HomePage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchHistoryDetails = async () => {
      const items = getLocalHistory();
      if (items.length === 0) return;
      setLoadingHistory(true);
      try {
        const detailedItems = await Promise.all(
          items.map(async (item: LocalHistoryItem) => {
            try {
              const agreement = await getAgreement(item.agreementId);
              return {
                ...item,
                status: agreement.status,
                pool: agreement.pool,
              };
            } catch (err) {
              return {
                ...item,
                status: "Unknown",
                pool: 0n,
              };
            }
          })
        );
        setHistoryItems(detailedItems);
      } catch (e) {
        console.error("Failed to load history details", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistoryDetails();
  }, []);

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromHistory(id);
    setHistoryItems((prev) => prev.filter((item) => item.agreementId !== id));
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
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16"
    >
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-3/5 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 bg-[rgba(183,110,121,0.1)] border border-[var(--accent-purple)]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[var(--accent-purple)] uppercase tracking-wider w-fit">
            <Sparkles size={13} className="text-[var(--accent-pink)]" />
            Empowered by GenLayer Intelligent Contracts
          </div>
          
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            Decentralized,{" "}
            <span className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
              AI-Arbitrated
            </span>{" "}
            Smart Marriage Vows
          </h1>
          
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
            VowChain couples qualitative natural-language marriage terms with secure, multi-judge LLM validator consensus. Deposit shared assets, define custom separation rules, and settle disputes objectively without legal fees or adversarial court battles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              to="/create"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] hover:opacity-95 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_4px_20px_rgba(183,110,121,0.25)]"
            >
              <Plus size={18} />
              <span>Create Smart Prenup</span>
            </Link>
            <Link
              to="/demo"
              className="flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[var(--border-color)] text-white font-bold py-4 px-8 rounded-xl transition-all"
            >
              <span>Explore Interactive Demos</span>
              <ArrowRight size={18} className="text-[var(--accent-pink)]" />
            </Link>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="w-full lg:w-2/5 flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-purple)]/20 to-[var(--accent-pink)]/20 rounded-3xl filter blur-xl opacity-30 animate-pulse" />
          <div className="card card-glow border border-[var(--border-color)] p-8 w-[340px] flex flex-col gap-6 relative bg-[var(--bg-secondary)]/90">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] flex items-center justify-center text-white">
                <Heart size={24} className="fill-white/20" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md">
                Active Agreement
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-wider font-semibold">
                Agreement ID
              </span>
              <span className="text-lg font-heading font-extrabold text-white">
                #0003_VALENTINE
              </span>
            </div>

            <div className="h-px bg-[var(--border-color)]" />

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                  Joint Pool
                </span>
                <p className="text-base font-bold text-white mt-0.5">150.00 GEN</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                  Reputation Threshold
                </span>
                <p className="text-base font-bold text-[#e2a76f] mt-0.5">Gold Tier</p>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-[var(--border-color)] text-xs text-[var(--color-text-secondary)] italic leading-relaxed text-left">
              "To support each other in all aspects... split shared savings 60/40 if dissolution occurs, taking caregiver roles into account."
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card flex flex-col gap-4 text-left">
          <div className="h-10 w-10 rounded-lg bg-[rgba(183,110,121,0.1)] border border-[var(--accent-purple)]/30 flex items-center justify-center text-[var(--accent-purple)]">
            <Scale size={20} />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">AI-Arbitrated Splits</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Consensus validator models parse subjective evidence and links to calculate a fair split using natural-language rules.
          </p>
        </div>
        <div className="card flex flex-col gap-4 text-left">
          <div className="h-10 w-10 rounded-lg bg-[rgba(226,167,111,0.1)] border border-[#e2a76f]/30 flex items-center justify-center text-[#e2a76f]">
            <Shield size={20} />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Canary Inject Protections</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Unique canary tokens protect validator prompts from adversarial text inputs or split manipulation.
          </p>
        </div>
        <div className="card flex flex-col gap-4 text-left">
          <div className="h-10 w-10 rounded-lg bg-[rgba(255,158,187,0.1)] border border-[var(--accent-pink)]/30 flex items-center justify-center text-[var(--accent-pink)]">
            <Award size={20} />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Partner Reputation System</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Earn on-chain reputation for amicable resolutions or lose points for bad-faith disputes.
          </p>
        </div>
      </div>

      {/* Local History Section */}
      {historyItems.length > 0 && (
        <div className="flex flex-col gap-6 text-left border-t border-[var(--border-color)] pt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl flex items-center gap-2 text-white">
              <History className="text-[var(--accent-purple)]" size={20} />
              Recent Agreements
            </h2>
            {loadingHistory && <span className="text-xs text-[var(--color-text-muted)] animate-pulse">Refreshing state...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyItems.map((item) => (
              <Link
                key={item.agreementId}
                to={`/agreement/${item.agreementId}`}
                className="card hover:-translate-y-1 transition-all border border-[var(--border-color)] hover:border-[var(--accent-purple)]/50 p-5 flex flex-col gap-4 relative group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-heading font-extrabold text-white">
                    Agreement #{item.agreementId}
                  </span>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item.agreementId)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all z-10"
                    title="Remove from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Status:</span>
                  <span className="text-xs font-bold text-white bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Joint Pool:</span>
                  <span className="text-xs font-bold text-emerald-400">{formatBalance(item.pool)}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                  <span>Role: {item.role === "partner_a" ? "Partner A" : item.role === "partner_b" ? "Partner B" : "Observer"}</span>
                  <span>Joined {new Date(item.addedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
