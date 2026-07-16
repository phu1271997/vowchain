import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  Shield,
  Sparkles,
  Plus,
  ArrowRight,
  History,
  Trash2,
  Award,
  Cpu,
  FileText,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getLocalHistory, removeFromHistory } from "../lib/agreementHistory";
import { getAgreement } from "../lib/contractApi";
import type { LocalHistoryItem } from "../lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

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
              return { ...item, status: agreement.status, pool: agreement.pool };
            } catch {
              return { ...item, status: "Unknown", pool: 0n };
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

  const features = [
    {
      icon: Scale,
      title: "AI-Arbitrated Splits",
      desc: "Multi-validator LLM consensus parses natural-language terms and evidence URLs to compute fair asset splits.",
      tile: "icon-tile",
    },
    {
      icon: Shield,
      title: "Canary Injection Defense",
      desc: "Dynamic canary tokens protect arbitration prompts from adversarial evidence and split manipulation.",
      tile: "icon-tile-gold",
    },
    {
      icon: Award,
      title: "On-Chain Reputation",
      desc: "Earn trust for amicable settlements. Lose points for bad-faith disputes or canary violations.",
      tile: "icon-tile-rose",
    },
    {
      icon: Lock,
      title: "Pull-Withdrawal Treasury",
      desc: "Settled funds credit a secure ledger. Partners claim shares safely — no reentrancy exposure.",
      tile: "icon-tile-emerald",
    },
  ];

  const steps = [
    { n: "01", title: "Draft terms", desc: "Write natural-language separation rules or apply a template." },
    { n: "02", title: "Joint deposit", desc: "Partner joins, both fund the shared GenLayer treasury pool." },
    { n: "03", title: "Evidence & AI", desc: "On dissolution, submit evidence; validators deliberate fairly." },
    { n: "04", title: "Dual sign-off", desc: "Both partners must accept the proposed split before release." },
  ];

  const stats = [
    { label: "Validator consensus", value: "Multi-LLM" },
    { label: "Split banding", value: "±10%" },
    { label: "Dispute cap", value: "3 strikes" },
    { label: "Wallet required", value: "Optional" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[55%] flex flex-col gap-7 text-left"
          >
            <div className="pill w-fit">
              <Sparkles size={12} />
              Powered by GenLayer Intelligent Contracts
            </div>

            <h1 className="font-heading font-extrabold text-[2.35rem] sm:text-5xl lg:text-[3.35rem] text-white leading-[1.1] tracking-tight">
              Smart prenups with{" "}
              <span className="text-gradient">AI arbitration</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              Deposit shared assets under natural-language covenants. If dissolution is needed,
              multi-judge LLM validators compute a fair split — no court battle, no opaque fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to="/create" className="btn btn-primary btn-lg">
                <Plus size={18} />
                Create Smart Prenup
              </Link>
              <Link to="/demo" className="btn btn-secondary btn-lg">
                Explore interactive demos
                <ArrowRight size={17} className="text-[var(--accent-purple)]" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Demo sandbox — no MetaMask
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Dual consent required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Canary-hardened prompts
              </span>
            </div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="w-full lg:w-[45%] flex justify-center relative"
          >
            <div
              className="absolute -inset-6 bg-gradient-to-tr from-[var(--accent-purple)]/15 via-transparent to-[var(--accent-pink)]/10 rounded-[2rem] blur-2xl"
              aria-hidden
            />
            <div className="card card-glow w-full max-w-[380px] p-7 flex flex-col gap-5 relative bg-[var(--bg-elevated)]">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center text-[#0c0a09] shadow-[0_6px_20px_rgba(201,162,122,0.3)]">
                  <Scale size={22} strokeWidth={2.25} />
                </div>
                <span className="badge badge-active">Active agreement</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[var(--color-text-muted)] font-mono uppercase tracking-wider font-semibold">
                  Agreement ID
                </span>
                <span className="text-xl font-heading font-bold text-white tracking-tight">
                  #0003_VALENTINE
                </span>
              </div>

              <div className="h-px bg-[var(--border-color)]" />

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wide">
                    Joint pool
                  </span>
                  <p className="text-lg font-heading font-bold text-white mt-0.5 tabular-nums">
                    150.00 GEN
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wide">
                    Trust tier
                  </span>
                  <p className="text-lg font-heading font-bold text-[var(--accent-cyan)] mt-0.5">
                    Gold
                  </p>
                </div>
              </div>

              <div className="surface text-sm text-[var(--color-text-secondary)] leading-relaxed text-left italic">
                “Split shared savings 60/40 if dissolution occurs, weighting caregiver contributions…”
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <Cpu size={12} className="text-[var(--accent-purple)]" />
                Ready for multi-validator arbitration
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4 text-left"
            >
              <p className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight">
                {s.value}
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 uppercase tracking-wide font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border-color)] bg-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-left max-w-2xl mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-purple)] mb-2">
              Why VowChain
            </p>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Impossible on ordinary chains
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              Only GenLayer’s non-deterministic consensus can read evidence URLs, parse subjective fairness, and settle qualitative disputes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f) => (
              <div key={f.title} className="card flex flex-col gap-4 text-left p-5 sm:p-6">
                <div className={f.tile}>
                  <f.icon size={18} />
                </div>
                <h3 className="font-heading font-semibold text-base text-white">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-grow">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-left max-w-2xl mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-purple)] mb-2">
            Lifecycle
          </p>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            From vow to settlement
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 text-left"
            >
              <span className="font-heading font-bold text-2xl text-[var(--accent-purple)]/40 tabular-nums">
                {step.n}
              </span>
              <h3 className="font-heading font-semibold text-white mt-2 mb-1.5">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2.5 w-5 h-px bg-[var(--border-color)]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="card card-glow p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[var(--bg-elevated)]">
          <div className="text-left max-w-lg">
            <div className="flex items-center gap-2 text-[var(--accent-purple)] mb-2">
              <FileText size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Try without gas</span>
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">
              Run the full lifecycle in Demo Sandbox
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              Swap Partner A / B keys, claim demo GEN, and walk amicable, caregiver, or deadlock scenarios.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/demo" className="btn btn-primary">
              Open demo gallery
              <ArrowRight size={16} />
            </Link>
            <Link to="/ethics" className="btn btn-secondary">
              Ethics & safety
            </Link>
          </div>
        </div>
      </section>

      {/* Local history */}
      {historyItems.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl flex items-center gap-2 text-white">
              <History className="text-[var(--accent-purple)]" size={20} />
              Recent agreements
            </h2>
            {loadingHistory && (
              <span className="text-xs text-[var(--color-text-muted)] animate-pulse">
                Refreshing…
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyItems.map((item) => (
              <Link
                key={item.agreementId}
                to={`/agreement/${item.agreementId}`}
                className="card card-interactive p-5 flex flex-col gap-3.5 relative group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-heading font-bold text-white">
                    Agreement #{item.agreementId}
                  </span>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item.agreementId)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-all z-10 min-h-9 min-w-9 flex items-center justify-center"
                    title="Remove from history"
                    aria-label="Remove from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold">
                    Status
                  </span>
                  <span className="text-xs font-semibold text-white bg-white/[0.05] border border-[var(--border-color)] px-2 py-0.5 rounded-md">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold">
                    Joint pool
                  </span>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums">
                    {formatBalance(item.pool)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1 border-t border-[var(--border-color)]">
                  <span>
                    Role:{" "}
                    {item.role === "partner_a"
                      ? "Partner A"
                      : item.role === "partner_b"
                      ? "Partner B"
                      : "Observer"}
                  </span>
                  <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};
