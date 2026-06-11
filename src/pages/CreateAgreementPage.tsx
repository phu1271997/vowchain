import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, AlertTriangle, ArrowRight, ArrowLeft, Copy, Check, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../lib/walletContext";
import { createAgreement } from "../lib/contractApi";
import { addToHistory } from "../lib/agreementHistory";
import { ConsensusProgress } from "../components/ConsensusProgress";

export const CreateAgreementPage: React.FC = () => {
  const { rawAccount, account, walletMode } = useWallet();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [partnerB, setPartnerB] = useState("");
  const [terms, setTerms] = useState("");
  const [deposit, setDeposit] = useState("");

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newAgreementId, setNewAgreementId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Term templates
  const templates = [
    {
      title: "Equitable Caregiver Support",
      text: "Assets accumulated during the marriage shall be split proportionally to financial contribution, except in the event of child-rearing or homemaking, in which case the caregiver partner shall receive an additional 15% adjustment to balance career sacrifices.",
    },
    {
      title: "Proportional Financial Contribution",
      text: "Upon dissolution, all mutual assets in the joint treasury pool will be divided proportionally based on each partner's documented financial deposits into the pool, verified by transaction histories and bank records.",
    },
    {
      title: "Equal 50/50 Division",
      text: "Regardless of financial or non-financial contributions during the marriage, all shared assets shall be split exactly 50% to Partner A and 50% to Partner B. Any discrepancies will be rounded to equal splits.",
    },
  ];

  const handleApplyTemplate = (text: string) => {
    setTerms(text);
  };

  const handleNext = () => {
    if (step === 1 && !partnerB.trim()) {
      setError("Partner B address is required.");
      return;
    }
    if (step === 2 && !terms.trim()) {
      setError("Please write or select separation terms.");
      return;
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const depositWei = deposit ? BigInt(deposit) : 0n;
      const id = await createAgreement(rawAccount, partnerB, terms, depositWei, setProgressMsg);
      setNewAgreementId(id);
      addToHistory(id, "partner_a");
      setStep(4); // Success step
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create agreement. Check if gas or inputs are correct.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (newAgreementId) {
      navigator.clipboard.writeText(newAgreementId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fillDemoAddress = () => {
    // Fill a mock second account
    setPartnerB("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      {/* Wizard Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Create Relationship Vow</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Step {step} of 4: {step === 1 ? "Partner details" : step === 2 ? "Write Vow Rules" : step === 3 ? "Fund Setup" : "Vow Registered"}
          </p>
        </div>

        {/* Step Indicator dots */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                step === i
                  ? "bg-[var(--accent-purple)] w-4"
                  : step > i
                  ? "bg-[var(--accent-pink)]"
                  : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-warning mb-6">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && <ConsensusProgress message={progressMsg} />}

      {!loading && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Step 1: Partner Details */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 text-left">
              <div className="bg-[rgba(183,110,121,0.05)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Your Wallet Address (Partner A)</span>
                <span className="text-sm font-mono text-white font-bold">{account}</span>
              </div>

              <div className="form-group">
                <label className="form-label flex justify-between items-center">
                  <span>Partner B Address (Your Spouse)</span>
                  {walletMode === "demo" && (
                    <button
                      type="button"
                      onClick={fillDemoAddress}
                      className="text-[10px] font-bold text-[var(--accent-purple)] uppercase hover:underline"
                    >
                      Autofill Mock Address
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={partnerB}
                  onChange={(e) => setPartnerB(e.target.value)}
                  className="form-input"
                  required
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Input your partner's GenLayer compatible hexadecimal address. This partner must join and deposit to activate the vow.
                </span>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-95"
                >
                  <span>Set Separation Rules</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Separation Terms */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 text-left">
              <div className="form-group">
                <label className="form-label">Natural Language Agreement & Separation Terms</label>
                <textarea
                  placeholder="Describe how assets should be divided in case of separation. Be specific about assets, percentages, and roles."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="form-textarea h-[160px]"
                  required
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Be descriptive. AI consensus validators will read this text during arbitration to evaluate evidence.
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Apply Templates</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {templates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(t.text)}
                      className="bg-black/20 hover:bg-black/40 border border-[var(--border-color)] hover:border-[var(--accent-purple)]/50 rounded-xl p-3.5 text-left flex flex-col gap-1.5 transition-all"
                    >
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <FileText size={12} className="text-[var(--accent-purple)]" />
                        {t.title}
                      </span>
                      <span className="text-[9px] text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
                        {t.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-white font-bold px-6 py-3 rounded-xl"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-95"
                >
                  <span>Deposit Funds</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Deposit Amount */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 text-left">
              <div className="form-group">
                <label className="form-label">Initial Deposit contribution (Wei)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="form-input font-mono"
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Optionally deposit initial assets into the joint pool. Leave as 0 if funding later. (1 GEN = 10^18 Wei)
                </span>
              </div>

              <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Summary</span>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">Partner B Address:</span>
                  <span className="text-white font-mono">{partnerB}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[var(--color-text-muted)]">Initial Deposit:</span>
                  <span className="text-emerald-400 font-bold">{deposit ? `${Number(deposit) / 1e18} GEN` : "0.00 GEN"}</span>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-white font-bold px-6 py-3 rounded-xl"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold px-8 py-3.5 rounded-xl hover:opacity-95 shadow-[0_4px_15px_rgba(183,110,121,0.25)]"
                >
                  <Heart size={16} className="fill-white/10" />
                  <span>Initialize Agreement Vow</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success Details */}
          {step === 4 && newAgreementId && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card bg-[rgba(27,8,14,0.4)] border border-[var(--border-color)] p-8 text-center flex flex-col items-center gap-6"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Heart size={30} className="fill-emerald-400/20" />
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-2xl text-white">Vow Successfully Drafted!</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-md mx-auto">
                  Your smart prenuptial agreement is now registered on GenLayer. Copy the Agreement ID and share it with your partner.
                </p>
              </div>

              {/* ID Card Display */}
              <div className="bg-black/40 border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Vowchain Agreement ID
                </span>
                
                <div className="flex items-center justify-between bg-black/50 border border-[var(--border-color)] px-4 py-3 rounded-xl font-mono text-lg font-bold text-white">
                  <span>#{newAgreementId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-[var(--color-text-secondary)] hover:text-white transition-colors"
                  >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 w-full justify-center">
                <button
                  type="button"
                  onClick={() => navigate(`/agreement/${newAgreementId}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold py-3.5 px-8 rounded-xl hover:opacity-95 shadow-[0_4px_15px_rgba(183,110,121,0.2)]"
                >
                  <span>Go to Vow Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </form>
      )}
    </motion.div>
  );
};
