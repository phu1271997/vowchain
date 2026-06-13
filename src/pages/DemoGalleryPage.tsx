import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Coins, ArrowRight, HelpCircle, Check, Key } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../lib/walletContext";

interface Scenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  partnerAName: string;
  partnerAAddr: string;
  partnerAPK: string;
  partnerBName: string;
  partnerBAddr: string;
  partnerBPK: string;
  terms: string;
  deposits: string;
  expectedSplit: string;
  details: string;
}

export const DemoGalleryPage: React.FC = () => {
  const { account, walletMode, setDemoPrivateKey, requestDemoFaucet } = useWallet();
  const navigate = useNavigate();

  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Seeded Scenarios using standard Anvil/Hardhat accounts
  const scenarios: Scenario[] = [
    {
      id: "amicable",
      title: "The Amicable Split",
      badge: "Amicable Resolution",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      partnerAName: "Alice (Earner)",
      partnerAAddr: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      partnerAPK: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Anvil 0
      partnerBName: "Bob (Partner)",
      partnerBAddr: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      partnerBPK: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Anvil 1
      terms: "All shared assets deposited into the pool will be split proportionally based on each partner's original contribution deposits.",
      deposits: "Alice: 80 GEN, Bob: 20 GEN (Total Pool: 100 GEN)",
      expectedSplit: "80% Alice / 20% Bob",
      details: "An easy resolution where both parties submit bank sheets and deposits verifying the 80/20 division. The AI judges compute an exact 80/20 split, signed off instantly by both.",
    },
    {
      id: "caregiver",
      title: "Caregiver & Career Balance",
      badge: "Equitable Adjustment",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      partnerAName: "Charlie (Career Focus)",
      partnerAAddr: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      partnerAPK: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Anvil 2
      partnerBName: "Diana (Home Support)",
      partnerBAddr: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      partnerBPK: "0x7c81524e838b0379de8b26f263d70f55261d54d9e1022e15c46b6a203756292c", // Anvil 3
      terms: "Joint assets shall be split based on contributions. If one partner sacrificed full-time employment to manage childcare and domestic homemaking, the AI arbitrator shall adjust the split up to 20% in their favor to ensure career equity.",
      deposits: "Charlie: 90 GEN, Diana: 10 GEN (Total Pool: 100 GEN)",
      expectedSplit: "70% Charlie / 30% Diana (AI adds 20% caregiver credit)",
      details: "A disputed division where Charlie claims 90% due to deposits. Diana logs evidence of child rearing and career sacrifices. The AI judges adjust the split to 70/30 to reflect the caregiver clause.",
    },
    {
      id: "deadlock",
      title: "The Deadlocked Vow",
      badge: "Adversarial Safeguards",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      partnerAName: "Ethan (Partner A)",
      partnerAAddr: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      partnerAPK: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Anvil 0
      partnerBName: "Fiona (Partner B)",
      partnerBAddr: "0x15d34AAf54a67C64304919045538e1259D24e847",
      partnerBPK: "0x47e173b1e9c5031b6b5a5c999c065158c621d9486c991410686B84c29aCC3318", // Anvil 4
      terms: "All shared assets shall be split 60/40 in favor of Partner A.",
      deposits: "Ethan: 50 GEN, Fiona: 50 GEN (Total Pool: 100 GEN)",
      expectedSplit: "50% Ethan / 50% Fiona (Forced Deadlock Division)",
      details: "A complex adversarial separation. Both partners dispute split proposals back and forth. After 3 failed attempts, the contract enters DEADLOCK status, locking assets until both sign a 50/50 mutual release.",
    },
  ];

  const handleSwapAccount = (pk: string, role: string, scenarioId: string) => {
    setDemoPrivateKey(pk);
    setActiveScenario(scenarioId);
    console.log("Swapped sandbox account to", role);
  };

  const handleFaucet = async () => {
    setFaucetLoading(true);
    setFaucetSuccess(false);
    try {
      const res = await requestDemoFaucet();
      if (res) {
        setFaucetSuccess(true);
        setTimeout(() => setFaucetSuccess(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFaucetLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-10 text-left"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Sparkles className="text-[var(--accent-purple)]" size={26} />
            Interactive Demo Sandbox
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Test the complete contract lifecycle without spending gas. Swap accounts instantly to try both partner roles.
          </p>
        </div>

        {/* Faucet button */}
        {walletMode === "demo" && (
          <button
            onClick={handleFaucet}
            disabled={faucetLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:opacity-95 shadow-[0_4px_12px_rgba(183,110,121,0.2)] disabled:opacity-50"
          >
            {faucetSuccess ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Claimed 100 GEN!</span>
              </>
            ) : (
              <>
                <Coins size={14} />
                <span>Claim 100 Demo GEN</span>
              </>
            )}
          </button>
        )}
      </div>

      {walletMode !== "demo" && (
        <div className="alert alert-info">
          <HelpCircle size={18} />
          <span className="text-xs">
            You are currently connected to MetaMask. To hot-swap accounts in this gallery, please click "Use Demo Mode" in the Navbar.
          </span>
        </div>
      )}

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 gap-8">
        {scenarios.map((scenario) => {
          const isSelectedScenario = activeScenario === scenario.id;
          
          return (
            <div
              key={scenario.id}
              className={`card border transition-all p-6 flex flex-col gap-5 ${
                isSelectedScenario
                  ? "border-[var(--accent-purple)] bg-[rgba(183,110,121,0.03)] shadow-glow"
                  : "border-[var(--border-color)] hover:border-[var(--border-color)]/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-color)]/30 pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">{scenario.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{scenario.deposits}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${scenario.badgeColor}`}>
                  {scenario.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Details list */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Draft terms</span>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed italic bg-black/20 rounded-xl p-3 border border-[var(--border-color)]">
                      "{scenario.terms}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Details & Setup</span>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{scenario.details}</p>
                  </div>
                </div>

                {/* Swap Credentials Dashboard Panel */}
                <div className="lg:col-span-1 bg-black/20 border border-[var(--border-color)] rounded-2xl p-5 flex flex-col gap-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Key size={14} className="text-[var(--accent-purple)]" />
                    Sandbox Credentials
                  </span>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleSwapAccount(scenario.partnerAPK, "partner_a", scenario.id)}
                      disabled={walletMode !== "demo"}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                        isSelectedScenario && account?.toLowerCase() === scenario.partnerAAddr.toLowerCase()
                          ? "bg-[rgba(183,110,121,0.15)] border-[var(--accent-purple)] text-white"
                          : "bg-black/30 border-[var(--border-color)] text-[var(--color-text-secondary)] hover:border-[var(--accent-purple)]/50 hover:text-white"
                      }`}
                    >
                      <span>Login: {scenario.partnerAName}</span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">A (Initiator)</span>
                    </button>

                    <button
                      onClick={() => handleSwapAccount(scenario.partnerBPK, "partner_b", scenario.id)}
                      disabled={walletMode !== "demo"}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                        isSelectedScenario && account?.toLowerCase() === scenario.partnerBAddr.toLowerCase()
                          ? "bg-[rgba(226,167,111,0.15)] border-[#e2a76f] text-white"
                          : "bg-black/30 border-[var(--border-color)] text-[var(--color-text-secondary)] hover:border-[#e2a76f]/50 hover:text-white"
                      }`}
                    >
                      <span>Login: {scenario.partnerBName}</span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">B (Partner)</span>
                    </button>
                  </div>

                  <div className="h-px bg-[var(--border-color)] my-1" />

                  <div className="flex flex-col gap-1 text-[10px]">
                    <span className="text-[var(--color-text-muted)] uppercase font-semibold">Expected Split:</span>
                    <span className="text-[#e2a76f] font-bold">{scenario.expectedSplit}</span>
                  </div>
                </div>

              </div>

              {isSelectedScenario && (
                <div className="border-t border-[var(--border-color)]/30 pt-4 flex justify-end">
                  <button
                    onClick={() => navigate("/create")}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:opacity-95"
                  >
                    <span>Draft new prenup for this scenario</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
