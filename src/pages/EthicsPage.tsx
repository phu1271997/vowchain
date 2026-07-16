import React from "react";
import { HelpCircle, Scale, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export const EthicsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8 text-left"
    >
      <div className="page-header">
        <h2 className="page-title">
          <HelpCircle className="text-[var(--accent-purple)]" size={24} />
          Ethics & legal considerations
        </h2>
        <p className="page-subtitle">
          Matrimonial disputes are highly sensitive. Read our AI safety boundaries and legal limitations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Advisory Boundaries */}
        <div className="flex flex-col gap-6">
          <div className="card border border-[var(--border-color)] p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <Scale size={18} className="text-[#e2a76f]" />
              1. Advisory Boundaries
            </h3>
            
            <div className="flex flex-col gap-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              <p>
                <span className="text-white font-bold">No Legal Advice:</span> VowChain contract code, prompt parameters, and output recommendations do not constitute legal advice. AI arbitration is intended as a neutral "fairness assist" tool, not to replace qualified family law attorneys.
              </p>
              <p>
                <span className="text-white font-bold">Jurisdictional Variations:</span> Family and marriage laws vary drastically by region. Prenuptial agreements require strict notary steps and disclosures to be legally binding in court. VowChain cannot guarantee enforceability in municipal courts.
              </p>
            </div>
          </div>

          <div className="card border border-[var(--border-color)] p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-400" />
              2. Escalation Covenants
            </h3>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              <p>
                If either spouse feels the AI proposal is unfair, they can trigger <span className="text-rose-400 font-semibold">dispute_proposal()</span> to immediately reset the vow back to DISSOLVING.
              </p>
              <p>
                If disputes occur 3 times, the contract locks in <span className="text-white font-bold">DEADLOCK</span>. Assets remain locked until both sign a 50/50 division, or off-chain legal intervention resolves the dispute.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Guardrails */}
        <div className="flex flex-col gap-6">
          <div className="card card-glow border border-[var(--border-color)] p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--accent-purple)]" />
              3. AI Safety Guardrails
            </h3>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              <p>
                To mitigate model hallucinations and input manipulation, VowChain implements defensive guardrails:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-2.5 mt-1 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <span className="text-white font-semibold">Double Sign-off Consent:</span> AI splits are strictly advisory. Assets are only released when both spouses sign the proposal.
                </li>
                <li>
                  <span className="text-white font-semibold">Canary Token Defense:</span> Dynamic canary values verify that evidence strings do not bypass system instructions or alter split weights.
                </li>
                <li>
                  <span className="text-white font-semibold">Banding Consensus:</span> Validators run comparative equivalence prompts inside a 10% round band to stabilize consensus.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
