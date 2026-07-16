import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Award, Search, HelpCircle, ShieldAlert, Award as BadgeIcon, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { getPartnerReputation } from "../lib/contractApi";

export const ReputationPage: React.FC = () => {
  const { address } = useParams<{ address?: string }>();
  const navigate = useNavigate();

  const [searchAddr, setSearchAddr] = useState(address || "");
  const [reputation, setReputation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevAddress, setPrevAddress] = useState(address);
  if (address !== prevAddress) {
    setPrevAddress(address);
    setSearchAddr(address || "");
  }

  const fetchReputation = async (targetAddr: string) => {
    if (!targetAddr.trim()) return;
    setLoading(true);
    setError(null);
    setReputation(null);
    try {
      const score = await getPartnerReputation(targetAddr);
      setReputation(score);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reputation from contract. Ensure the address format is correct.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReputation(address);
    }
  }, [address]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAddr.trim()) {
      navigate(`/reputation/${searchAddr}`);
    }
  };

  const getTierDetails = (score: number) => {
    if (score <= -2) {
      return {
        name: "Penalized Tier",
        desc: "Address has excessive dispute filings or canary violations.",
        color: "text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
        icon: <ShieldAlert size={28} className="text-rose-400 animate-bounce" />,
      };
    }
    if (score === -1 || score === 0) {
      return {
        name: "Standard Tier",
        desc: "Default initialization rating. Neutral standings.",
        color: "text-zinc-300 border-zinc-500/30 bg-zinc-500/10",
        icon: <Award size={28} className="text-zinc-400" />,
      };
    }
    if (score >= 1 && score <= 2) {
      return {
        name: "Bronze Standings",
        desc: "Successfully resolved initial vow settlements amicably.",
        color: "text-amber-600 border-amber-600/30 bg-amber-600/10 shadow-[0_0_15px_rgba(217,119,6,0.15)]",
        icon: <BadgeIcon size={28} className="text-amber-600" />,
      };
    }
    if (score >= 3 && score <= 4) {
      return {
        name: "Silver Standings",
        desc: "Multiple amicable contract completions without dispute.",
        color: "text-slate-300 border-slate-400/30 bg-slate-400/10 shadow-[0_0_15px_rgba(203,213,225,0.15)]",
        icon: <BadgeIcon size={28} className="text-slate-300" />,
      };
    }
    if (score >= 5 && score <= 7) {
      return {
        name: "Gold Tier",
        desc: "Trusted spouse partner. Excellent settlement credentials.",
        color: "text-[#e2a76f] border-[#e2a76f]/30 bg-[#e2a76f]/10 shadow-[0_0_15px_rgba(226,167,111,0.2)]",
        icon: <BadgeIcon size={28} className="text-[#e2a76f]" />,
      };
    }
    return {
      name: "Platinum Guardian",
      desc: "Impeccable relationship trust score. Highest credential rank.",
      color: "text-[var(--accent-purple)] border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/10 shadow-[0_0_20px_rgba(183,110,121,0.25)]",
      icon: <BadgeIcon size={28} className="text-[var(--accent-purple)]" />,
    };
  };

  const tier = reputation !== null ? getTierDetails(reputation) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-10 text-left"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
          <Award className="text-[var(--accent-purple)]" size={26} />
          Partner Reputation Registry
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Verify any address's trust score. Scores increase (+2/+1) for amicable settlements and decrease (-1) for disputes.
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearchSubmit} className="card border border-[var(--border-color)] p-6 flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label flex items-center gap-1.5">
            <Search size={14} className="text-[var(--accent-purple)]" />
            Wallet Address Lookup
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 0x address"
              value={searchAddr}
              onChange={(e) => setSearchAddr(e.target.value)}
              className="form-input font-mono text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading || !searchAddr}
              className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all"
            >
              Verify
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="alert alert-warning">
          <ShieldAlert size={18} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-[var(--accent-purple)]" />
        </div>
      )}

      {/* Result Display */}
      {!loading && reputation !== null && tier && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card border border-[var(--border-color)] p-8 flex flex-col sm:flex-row items-center gap-8 bg-[var(--bg-secondary)]/80"
        >
          {/* Badge Visualizer */}
          <div className={`h-24 w-24 rounded-2xl border flex items-center justify-center relative shrink-0 ${tier.color}`}>
            {tier.icon}
            <div className="absolute -bottom-2.5 bg-black/60 px-2 py-0.5 rounded border border-[var(--border-color)] text-[10px] font-mono font-bold text-white">
              Score: {reputation}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold font-mono">
                Registry Lookup Result
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-white mt-0.5">{tier.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{tier.desc}</p>
            </div>

            <div className="h-px bg-[var(--border-color)] w-full sm:w-2/3 my-1" />

            <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-[11px]">
              <div className="flex items-center gap-1 text-emerald-400">
                <ThumbsUp size={12} />
                <span>Amicable Release: {reputation > 0 ? `+${reputation}` : "0"} Points</span>
              </div>
              <div className="flex items-center gap-1 text-rose-400">
                <ThumbsDown size={12} />
                <span>Dispute Penalties: {reputation < 0 ? `${reputation}` : "0"} Points</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Informative description */}
      <div className="bg-[rgba(226,167,111,0.05)] border border-[var(--border-color)] rounded-xl p-5 flex gap-3">
        <HelpCircle size={18} className="text-[#e2a76f] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <span className="font-bold text-white uppercase text-[10px]">How does reputation work?</span>
          <p>
            VowChain tracks reputation to prevent bad-faith behavior and foster trust inside relationship pools.
          </p>
          <p>
            When agreements settle amicably without disputes, both partners earn <span className="text-emerald-400 font-bold">+2 reputation points</span> for the first proposal, or <span className="text-emerald-400 font-semibold">+1 point</span> for subsequent proposals.
          </p>
          <p>
            Conversely, filing a dispute deducts <span className="text-rose-400 font-bold">-1 reputation point</span>. Addresses that attempt prompt injection or canary violations face manual tier downgrades.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
