import React, { useEffect, useState, useCallback } from "react";
import { Coins, Wallet, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../lib/walletContext";
import { getWithdrawableBalance, withdrawFunds } from "../lib/contractApi";
import { ConsensusProgress } from "../components/ConsensusProgress";

export const TreasuryPage: React.FC = () => {
  const { account, rawAccount, refreshBalance } = useWallet();

  const [withdrawable, setWithdrawable] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [prevAccount, setPrevAccount] = useState(account);
  if (account !== prevAccount) {
    setPrevAccount(account);
    setLoading(true);
  }

  const fetchWithdrawable = useCallback(async () => {
    if (!account) return;
    try {
      const balance = await getWithdrawableBalance(account);
      setWithdrawable(balance);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch withdrawable balance from Treasury contract.");
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWithdrawable();
  }, [fetchWithdrawable]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || withdrawable === 0n) return;
    
    setActionLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await withdrawFunds(rawAccount, setProgressMsg);
      setSuccess(true);
      await fetchWithdrawable();
      await refreshBalance(); // Refresh wallet balance
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Withdrawal transaction failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatBalance = (wei: bigint) => {
    const gen = Number(wei) / 1e18;
    return `${gen.toFixed(4)} GEN`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw size={28} className="animate-spin text-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10 text-left"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Coins className="text-[var(--accent-purple)]" size={26} />
            Treasury & Settlement Pool
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Withdraw funds credited from settled vow divisions or check current solvency guarantees.
          </p>
        </div>

        <button onClick={fetchWithdrawable} className="flex items-center gap-1 text-xs text-[var(--accent-purple)] hover:text-[var(--accent-pink)] font-bold">
          <RefreshCw size={13} />
          Refresh Balance
        </button>
      </div>

      {error && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {actionLoading && <ConsensusProgress message={progressMsg} />}

      {!actionLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Withdrawal Card */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="card card-glow border border-[var(--border-color)] p-6 flex flex-col gap-5">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                <Wallet size={18} className="text-[var(--accent-purple)]" />
                Claim Share Releases
              </h3>

              <div className="bg-black/40 border border-[var(--border-color)] rounded-2xl p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                    Withdrawable Balance
                  </span>
                  <span className="text-3xl font-heading font-extrabold text-emerald-400 mt-1">
                    {formatBalance(withdrawable)}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Coins size={20} />
                </div>
              </div>

              <form onSubmit={handleWithdraw}>
                <button
                  type="submit"
                  disabled={withdrawable === 0n}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold py-4 px-6 rounded-xl hover:opacity-95 transition-all shadow-[0_4px_15px_rgba(183,110,121,0.25)] disabled:opacity-50"
                >
                  <span>Claim & Withdraw Funds</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {withdrawable === 0n && (
                <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                  * Your active account has no withdrawable allocations. Claims populate once an active vow transitions to SETTLED status.
                </p>
              )}
            </div>

            {success && (
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-3"
              >
                <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                <span className="text-xs text-emerald-300">
                  Withdrawal request finalized! Credited GEN tokens have been transferred to your wallet.
                </span>
              </motion.div>
            )}
          </div>

          {/* Right Security Explainer Column */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="card border border-[var(--border-color)] p-6 bg-[var(--bg-secondary)]/80 flex flex-col gap-4">
              <h4 className="font-heading font-bold text-white text-sm flex items-center gap-1.5 border-b border-[var(--border-color)] pb-3">
                <ShieldCheck size={16} className="text-[#e2a76f]" />
                Pull-Withdrawal Model
              </h4>

              <div className="flex flex-col gap-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                <p>
                  To secure user assets, VowChain operates a secure <span className="text-white font-semibold">Pull-Withdrawal Tokenomics Model</span>.
                </p>
                <p>
                  Rather than sending funds automatically during state updates, all split releases are transferred to an isolated credit ledger inside the Treasury contract.
                </p>
                <div className="h-px bg-[var(--border-color)]" />
                <ul className="list-disc list-inside flex flex-col gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                  <li>Mitigates reentrancy risks.</li>
                  <li>Prevents locked/lost funds due to contract execution gas limits.</li>
                  <li>Guarantees core contract solvency.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
};
