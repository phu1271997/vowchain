import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FileText, Upload, Scale, AlertTriangle, 
  RefreshCw, CheckCircle, ShieldAlert, Award, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../lib/walletContext";
import { 
  getAgreement, getProposal, initiateDissolution, submitEvidence, 
  proposeSplit, acceptProposal, disputeProposal, settleDeadlock
} from "../lib/contractApi";
import { addToHistory } from "../lib/agreementHistory";
import type { Agreement, Proposal } from "../lib/types";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { ConsensusProgress } from "../components/ConsensusProgress";
import { SplitProposalCard } from "../components/SplitProposalCard";

export const AgreementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { account, rawAccount } = useWallet();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"terms" | "evidence" | "proposal">("terms");

  // Evidence Form State
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceCategory, setEvidenceCategory] = useState("income");

  const [prevKey, setPrevKey] = useState({ id, account });
  if (id !== prevKey.id || account !== prevKey.account) {
    setPrevKey({ id, account });
    setLoading(true);
  }

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getAgreement(id);
      setAgreement(res);
      
      // Auto register role in history
      if (account) {
        const role = account.toLowerCase() === res.partner_a.toLowerCase()
          ? "partner_a"
          : account.toLowerCase() === res.partner_b.toLowerCase()
          ? "partner_b"
          : undefined;
        addToHistory(id, role);
      }

      if (res.status === "PROPOSED" || res.status === "SETTLED") {
        const prop = await getProposal(id);
        setProposal(prop);
      } else {
        setProposal(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load agreement details.");
    } finally {
      setLoading(false);
    }
  }, [id, account]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetails();
  }, [fetchDetails]);

  // Actions
  const handleInitiateDissolution = async () => {
    if (!id || !account) return;
    setActionLoading(true);
    setError(null);
    try {
      await initiateDissolution(rawAccount, id, setProgressMsg);
      setInfoMsg("Dissolution process successfully initiated. Both partners can now submit evidence.");
      await fetchDetails();
      setActiveTab("evidence");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initiate dissolution.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !account || !evidenceText) return;
    setActionLoading(true);
    setError(null);
    try {
      await submitEvidence(rawAccount, id, evidenceText, evidenceCategory, setProgressMsg);
      setInfoMsg("Your evidence details were registered successfully!");
      setEvidenceText("");
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit evidence.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComputeSplit = async () => {
    if (!id || !account) return;
    setActionLoading(true);
    setError(null);
    try {
      await proposeSplit(rawAccount, id, setProgressMsg);
      setInfoMsg("AI Judges finalized consensus. Custom proposed split generated.");
      await fetchDetails();
      setActiveTab("proposal");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Arbitration request failed. The validator Canary protections may have caught a security risk.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!id || !account) return;
    setActionLoading(true);
    setError(null);
    try {
      await acceptProposal(rawAccount, id, setProgressMsg);
      setInfoMsg("Signature submitted. Once both partners sign, funds will release to the Treasury.");
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign proposal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisputeProposal = async () => {
    if (!id || !account) return;
    setActionLoading(true);
    setError(null);
    try {
      await disputeProposal(rawAccount, id, setProgressMsg);
      navigate(`/agreement/${id}/dispute`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register dispute. Cooldown may be active.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettleDeadlock = async () => {
    if (!id || !account) return;
    setActionLoading(true);
    setError(null);
    try {
      await settleDeadlock(rawAccount, id, setProgressMsg);
      setInfoMsg("Mutual signature submitted for deadlock resolution. 50/50 split initialized.");
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit deadlock resolution signature.");
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

  if (!agreement) {
    return (
      <div className="card text-center py-12 flex flex-col items-center gap-4">
        <AlertTriangle size={32} className="text-amber-500" />
        <h3 className="font-heading font-bold text-xl text-white">Agreement Not Found</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Please verify the Agreement ID.</p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-2">Go Home</button>
      </div>
    );
  }

  const isPartnerA = account?.toLowerCase() === agreement.partner_a.toLowerCase();
  const isPartnerB = account?.toLowerCase() === agreement.partner_b.toLowerCase();
  const isParticipant = isPartnerA || isPartnerB;

  const hasSubmittedA = !!agreement.evidence_a;
  const hasSubmittedB = !!agreement.evidence_b;
  const bothSubmitted = hasSubmittedA && hasSubmittedB;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 text-left"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-extrabold text-2xl text-white">
              Vow Dashboard #{agreement.agreement_id}
            </h2>
            <StatusBadge status={agreement.status} />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-mono">
            On-Chain ID: {agreement.agreement_id}
          </p>
        </div>

        <button onClick={fetchDetails} className="flex items-center gap-1 text-xs text-[var(--accent-purple)] hover:text-[var(--accent-pink)] font-bold">
          <RefreshCw size={13} />
          Refresh Details
        </button>
      </div>

      {/* Progress Timeline */}
      <div className="card border border-[var(--border-color)] p-6 bg-black/10">
        <Timeline currentStatus={agreement.status} />
      </div>

      {error && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {infoMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span className="text-xs">{infoMsg}</span>
        </div>
      )}

      {actionLoading && <ConsensusProgress message={progressMsg} />}

      {/* Main Grid split */}
      {!actionLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Summary Details Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card border border-[var(--border-color)] p-6 flex flex-col gap-5 bg-[var(--bg-secondary)]/80">
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider border-b border-[var(--border-color)] pb-3">
                Joint Assets & Partners
              </h3>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Total Joint Pool</span>
                <span className="text-xl font-heading font-extrabold text-emerald-400">{formatBalance(agreement.pool)}</span>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-color)]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-muted)] font-semibold">Partner A Deposit:</span>
                  <span className="text-white font-mono font-bold">{formatBalance(agreement.deposit_a)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-muted)] font-semibold">Partner B Deposit:</span>
                  <span className="text-white font-mono font-bold">{formatBalance(agreement.deposit_b)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-color)]/30 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold">Partner A Address</span>
                  <span className="text-white font-mono truncate">{agreement.partner_a}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold">Partner B Address</span>
                  <span className="text-white font-mono truncate">{agreement.partner_b}</span>
                </div>
              </div>

              {/* Observer alert */}
              {!isParticipant && (
                <div className="bg-black/30 border border-amber-500/20 text-amber-500/80 rounded-xl p-3 text-[10px] italic leading-relaxed">
                  Notice: You are viewing this contract as an external observer. Write actions and voting are locked for your account.
                </div>
              )}
            </div>
          </div>

          {/* Right Actionable Column (Tabs) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Tab Headers */}
            <div className="flex border-b border-[var(--border-color)] gap-2">
              <button
                onClick={() => setActiveTab("terms")}
                className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
                  activeTab === "terms"
                    ? "border-[var(--accent-purple)] text-white"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-white"
                }`}
              >
                Vow Terms
              </button>
              <button
                onClick={() => setActiveTab("evidence")}
                className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
                  activeTab === "evidence"
                    ? "border-[var(--accent-purple)] text-white"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-white"
                }`}
              >
                Evidence Panel
              </button>
              {proposal && (
                <button
                  onClick={() => setActiveTab("proposal")}
                  className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
                    activeTab === "proposal"
                      ? "border-[var(--accent-purple)] text-white"
                      : "border-transparent text-[var(--color-text-muted)] hover:text-white"
                  }`}
                >
                  AI Split proposal
                </button>
              )}
            </div>

            {/* Tab Content: Terms */}
            {activeTab === "terms" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 flex flex-col gap-4">
                <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                  <FileText size={18} className="text-[var(--accent-purple)]" />
                  Natural Language Agreement Rules
                </h3>
                <div className="bg-black/30 border border-[var(--border-color)] rounded-xl p-5 text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
                  "{agreement.terms}"
                </div>

                {agreement.status === "ACTIVE" && isParticipant && (
                  <div className="mt-4 border-t border-[var(--border-color)] pt-5">
                    <button
                      onClick={handleInitiateDissolution}
                      className="bg-transparent hover:bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <ShieldAlert size={16} />
                      <span>Declare Relationship Dissolution</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab Content: Evidence Panel */}
            {activeTab === "evidence" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                
                {/* Evidence submit form for participating partners (only during DISSOLVING) */}
                {agreement.status === "DISSOLVING" && isParticipant && (
                  <div className="card p-6 flex flex-col gap-4">
                    <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                      <Upload size={18} className="text-[var(--accent-pink)]" />
                      Upload Contribution Evidence
                    </h3>

                    <form onSubmit={handleSubmitEvidence} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Evidence Category</label>
                          <select
                            value={evidenceCategory}
                            onChange={(e) => setEvidenceCategory(e.target.value)}
                            className="form-input bg-black/40 text-white"
                          >
                            <option value="income">Financial Income / Deposit</option>
                            <option value="real_estate">Real Estate & Assets</option>
                            <option value="childcare">Childcare & Homemaking</option>
                            <option value="contribution">Non-Financial Labor</option>
                            <option value="other">Other Supporting evidence</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Evidence details (URLs and text statements)</label>
                        <textarea
                          placeholder="Provide qualitative arguments or URL links (starting with http:// or https://) verifying financial statements, bank sheets, or details."
                          value={evidenceText}
                          onChange={(e) => setEvidenceText(e.target.value)}
                          className="form-textarea h-[120px]"
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary flex items-center justify-center gap-1.5 w-fit">
                        <Upload size={15} />
                        Submit My Evidence
                      </button>
                    </form>
                  </div>
                )}

                {/* Evidence Details display lists */}
                <div className="card p-6 flex flex-col gap-6">
                  <h3 className="font-heading font-bold text-white text-base">
                    Submitted Evidence Register
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-bold text-[#b76e79] uppercase tracking-wider flex items-center gap-1">
                        Partner A Evidence
                        {hasSubmittedA && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Submitted</span>}
                      </span>
                      <div className="bg-black/30 border border-[var(--border-color)] rounded-xl p-4 text-xs text-[var(--color-text-secondary)] leading-relaxed h-[130px] overflow-y-auto">
                        {hasSubmittedA ? (
                          <>
                            <div className="font-semibold text-white mb-1 uppercase text-[10px]">Category: {agreement.evidence_a_category || "General"}</div>
                            {agreement.evidence_a}
                          </>
                        ) : (
                          <span className="text-[var(--color-text-muted)] italic">No evidence uploaded yet.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-bold text-[#e2a76f] uppercase tracking-wider flex items-center gap-1">
                        Partner B Evidence
                        {hasSubmittedB && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Submitted</span>}
                      </span>
                      <div className="bg-black/30 border border-[var(--border-color)] rounded-xl p-4 text-xs text-[var(--color-text-secondary)] leading-relaxed h-[130px] overflow-y-auto">
                        {hasSubmittedB ? (
                          <>
                            <div className="font-semibold text-white mb-1 uppercase text-[10px]">Category: {agreement.evidence_b_category || "General"}</div>
                            {agreement.evidence_b}
                          </>
                        ) : (
                          <span className="text-[var(--color-text-muted)] italic">No evidence uploaded yet.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compute Split (only visible in DISSOLVING status) */}
                  {agreement.status === "DISSOLVING" && (
                    <div className="border-t border-[var(--border-color)] pt-5 mt-2 flex flex-col gap-3">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        When both partners have logged evidence and facts, trigger the asynchronous LLM validator consensus computation.
                      </p>
                      
                      <button
                        onClick={handleComputeSplit}
                        disabled={!bothSubmitted || !isParticipant}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold py-4 px-8 rounded-xl hover:opacity-95 transition-all shadow-[0_4px_15px_rgba(183,110,121,0.2)] disabled:opacity-50"
                      >
                        <Scale size={18} />
                        <span>Run AI Arbitration Consensus</span>
                      </button>
                      
                      {!bothSubmitted && (
                        <span className="text-[10px] text-rose-400 font-bold self-center">
                          * Both Partner A and Partner B must submit evidence to compile parameters.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab Content: Proposal */}
            {activeTab === "proposal" && proposal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SplitProposalCard
                  proposal={proposal}
                  partnerAName="Partner A"
                  partnerBName="Partner B"
                  partnerAAddr={agreement.partner_a}
                  partnerBAddr={agreement.partner_b}
                  onAccept={handleAcceptProposal}
                  onDispute={handleDisputeProposal}
                  loading={actionLoading}
                  userAddress={account}
                />
              </motion.div>
            )}

            {/* Deadlock State display */}
            {agreement.status === "DEADLOCK" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card border border-rose-500/20 bg-rose-500/5 p-6 flex flex-col gap-4 text-left"
              >
                <div className="flex items-center gap-2.5 text-rose-400">
                  <ShieldAlert size={22} />
                  <h3 className="font-heading font-bold text-base leading-snug">Vow Agreement in Deadlock</h3>
                </div>
                
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  This prenuptial agreement has disputed splits 3 times without consensus. Under the contract's protective covenants, the assets in the joint pool are locked until partners mutually agree to dissolve the deadlock via a strict 50/50 division.
                </p>

                {isParticipant && (
                  <div className="border-t border-[var(--border-color)] pt-4 mt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSettleDeadlock}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold py-3 px-6 rounded-xl hover:opacity-95"
                    >
                      <CheckCircle size={15} />
                      <span>Sign 50/50 Deadlock Release</span>
                    </button>
                    
                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-secondary)] mt-1.5 sm:mt-0">
                      <span>Sign-off: A: {agreement.evidence_a ? "✅ Joined" : "⏳ Pending"} | B: {agreement.evidence_b ? "✅ Joined" : "⏳ Pending"}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Settled State display */}
            {agreement.status === "SETTLED" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col gap-4 text-left"
              >
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <Award size={22} />
                  <h3 className="font-heading font-bold text-base">Vow Successfully Settled</h3>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Both partners signed and confirmed the final division parameters. The joint pool has been released, and the respective splits have been sent to the Treasury contract.
                </p>

                {isParticipant && (
                  <button
                    onClick={() => navigate("/treasury")}
                    className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[var(--border-color)] text-white font-bold py-3 px-6 rounded-xl w-fit mt-2 transition-all"
                  >
                    <span>Go to Treasury & Withdraw</span>
                    <ArrowRight size={15} className="text-[var(--accent-pink)]" />
                  </button>
                )}
              </motion.div>
            )}

          </div>

        </div>
      )}
    </motion.div>
  );
};
