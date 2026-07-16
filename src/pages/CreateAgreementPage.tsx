import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, AlertTriangle, ArrowRight, ArrowLeft, Copy, Check, FileText, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../lib/walletContext";
import {
  createAgreement,
  healthCheck,
  isCoreConfigured,
  CORE_CONTRACT_ADDRESS,
} from "../lib/contractApi";
import { addToHistory } from "../lib/agreementHistory";
import { ConsensusProgress } from "../components/ConsensusProgress";
import { parseEther } from "viem";

export const CreateAgreementPage: React.FC = () => {
  const { rawAccount, account, walletMode, switchToDemo, balance } = useWallet();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [partnerB, setPartnerB] = useState("");
  const [terms, setTerms] = useState("");
  /** Deposit in GEN (human units), converted to wei on submit */
  const [depositGen, setDepositGen] = useState("0");

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newAgreementId, setNewAgreementId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState("Checking GenLayer binding…");
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

  useEffect(() => {
    healthCheck().then((r) => {
      setHealthOk(r.ok);
      setHealth(r.message);
    });
  }, []);

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
    if (step === 1) {
      const addr = partnerB.trim();
      if (!addr.startsWith("0x") || addr.length !== 42) {
        setError("Partner B must be a valid 0x address (42 characters).");
        return;
      }
      if (account && addr.toLowerCase() === account.toLowerCase()) {
        setError("Partner B cannot be your own address.");
        return;
      }
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
    if (!account || !rawAccount) {
      setError("Wallet not ready. Switch to Demo Sandbox mode in the navbar.");
      return;
    }
    if (!isCoreConfigured()) {
      setError(
        "Core contract address is not configured (VITE_VOWCHAIN_CORE_ADDRESS). Deploy vowchain_core.py and set the env on Vercel."
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Prefer GEN units in the form (not raw wei) to avoid judge confusion
      let depositWei = 0n;
      const genStr = (depositGen || "0").trim();
      if (genStr && genStr !== "0") {
        depositWei = parseEther(genStr as `${number}`);
      }
      const id = await createAgreement(
        rawAccount,
        partnerB.trim(),
        terms.trim(),
        depositWei,
        setProgressMsg
      );
      setNewAgreementId(id);
      addToHistory(id, "partner_a");
      setStep(4); // Success step
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Failed to create agreement. If you saw wallet_getSnaps, switch to Demo Sandbox mode and retry."
      );
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

  const stepLabels = ["Partner", "Terms", "Deposit", "Done"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
    >
      <div className="page-header-row !mb-6">
        <div>
          <h2 className="page-title">
            <Heart className="text-[var(--accent-purple)]" size={24} />
            Create relationship vow
          </h2>
          <p className="page-subtitle mt-1">
            Step {step} of 4 —{" "}
            {step === 1
              ? "Partner details"
              : step === 2
              ? "Separation rules"
              : step === 3
              ? "Initial deposit"
              : "Registered"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  step === i
                    ? "bg-[var(--accent-purple)] border-transparent text-[#0c0a09]"
                    : step > i
                    ? "bg-[var(--accent-purple)]/25 border-[var(--accent-purple)]/40 text-[var(--accent-purple)]"
                    : "bg-transparent border-[var(--border-color)] text-[var(--color-text-muted)]"
                }`}
                title={stepLabels[i - 1]}
              >
                {i}
              </div>
              {i < 4 && (
                <div
                  className={`hidden sm:block w-6 h-px ${
                    step > i ? "bg-[var(--accent-purple)]/50" : "bg-[var(--border-color)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Binding / wallet hints */}
      <div className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-inset)] p-4 text-left text-xs space-y-2">
        <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
          <Info size={14} className="mt-0.5 shrink-0 text-[var(--accent-purple)]" />
          <div className="space-y-1.5">
            <p>
              <strong className="text-white">Tip:</strong> Use{" "}
              <button type="button" onClick={switchToDemo} className="text-[var(--accent-purple)] font-bold underline underline-offset-2">
                Demo Sandbox
              </button>{" "}
              to create agreements without MetaMask Snaps (avoids{" "}
              <code className="text-amber-300/90 text-[10px]">wallet_getSnaps</code>).
            </p>
            <p className="font-mono text-[10px] break-all text-[var(--color-text-muted)]">
              Core: {isCoreConfigured() ? CORE_CONTRACT_ADDRESS : "NOT SET — configure VITE_VOWCHAIN_CORE_ADDRESS"}
            </p>
            <p className={healthOk ? "text-emerald-400" : healthOk === false ? "text-rose-400" : "text-zinc-400"}>
              {healthOk === true ? "✓ " : healthOk === false ? "✗ " : "… "}
              {health}
            </p>
            <p className="text-[var(--color-text-muted)]">
              Mode: <strong className="text-white">{walletMode}</strong> · Balance: {balance}
            </p>
          </div>
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
              <div className="surface flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Your wallet (Partner A)</span>
                <span className="text-sm font-mono text-white font-semibold break-all">{account}</span>
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
                  className="btn btn-primary"
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
                <button type="button" onClick={handleBack} className="btn btn-secondary">
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button type="button" onClick={handleNext} className="btn btn-primary">
                  Deposit funds
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Deposit Amount */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 text-left">
              <div className="form-group">
                <label className="form-label">Initial Deposit (GEN)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={depositGen}
                  onChange={(e) => setDepositGen(e.target.value)}
                  className="form-input font-mono"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {["0", "1", "5", "10"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDepositGen(v)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent-purple)] text-white"
                    >
                      {v} GEN
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Optional joint-pool deposit. Converted to wei on-chain (1 GEN = 10¹⁸ wei). Use 0 to create the vow without funding.
                </span>
              </div>

              <div className="surface flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Summary</span>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">Wallet mode:</span>
                  <span className="text-white font-bold">{walletMode === "demo" ? "Demo Sandbox (no Snaps)" : "MetaMask"}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[var(--color-text-muted)]">Partner B Address:</span>
                  <span className="text-white font-mono truncate max-w-[55%]">{partnerB}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[var(--color-text-muted)]">Initial Deposit:</span>
                  <span className="text-emerald-400 font-bold">{depositGen || "0"} GEN</span>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" onClick={handleBack} className="btn btn-secondary">
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button type="submit" className="btn btn-primary">
                  <Heart size={16} />
                  Initialize agreement
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success Details */}
          {step === 4 && newAgreementId && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card card-glow p-8 sm:p-10 text-center flex flex-col items-center gap-6"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Heart size={28} />
              </div>

              <div>
                <h3 className="font-heading font-bold text-2xl text-white tracking-tight">
                  Vow successfully drafted
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-md mx-auto leading-relaxed">
                  Your prenup is registered on GenLayer. Copy the Agreement ID and share it with your partner.
                </p>
              </div>

              <div className="surface w-full max-w-sm flex flex-col gap-3">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Agreement ID
                </span>
                <div className="flex items-center justify-between bg-black/40 border border-[var(--border-color)] px-4 py-3 rounded-xl font-mono text-lg font-bold text-white">
                  <span>#{newAgreementId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-2 hover:bg-white/5 rounded-lg text-[var(--color-text-secondary)] hover:text-white transition-colors"
                    aria-label="Copy agreement ID"
                  >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/agreement/${newAgreementId}`)}
                className="btn btn-primary"
              >
                Go to dashboard
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </form>
      )}
    </motion.div>
  );
};
