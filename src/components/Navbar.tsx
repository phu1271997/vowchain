import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scale, Wallet, Coins, Menu, X, FlaskConical } from "lucide-react";
import { useWallet } from "../lib/walletContext";

export const Navbar: React.FC = () => {
  const { account, walletMode, balance, connectMetaMask, switchToDemo } = useWallet();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { path: "/create", label: "Create" },
    { path: "/join", label: "Join" },
    { path: "/demo", label: "Demos" },
    { path: "/treasury", label: "Treasury" },
    { path: "/ethics", label: "Ethics" },
  ];

  const shortAddr = account
    ? `${account.substring(0, 6)}…${account.substring(account.length - 4)}`
    : "Disconnected";

  return (
    <nav className="nav-shell">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.25rem]">
          <div className="flex items-center gap-8">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center shadow-[0_4px_14px_rgba(201,162,122,0.3)] group-hover:scale-[1.04] transition-transform">
                <Scale size={18} className="text-[#0c0a09]" strokeWidth={2.25} />
              </div>
              <div className="leading-tight">
                <span className="font-heading font-bold text-[1.05rem] tracking-tight text-white block">
                  VowChain
                </span>
                <span className="hidden sm:block text-[10px] text-[var(--color-text-muted)] tracking-[0.08em] uppercase font-semibold">
                  GenLayer Prenups
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop wallet */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[var(--bg-inset)] border border-[var(--border-color)] rounded-xl p-1 pl-3">
              <div className="hidden lg:flex flex-col items-end pr-1">
                <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wide">
                  {walletMode === "demo" ? "Sandbox" : "MetaMask"}
                </span>
                <span className="text-xs font-semibold text-white tabular-nums">{balance}</span>
              </div>

              <div className="h-6 w-px bg-[var(--border-color)] hidden lg:block" />

              {walletMode === "demo" ? (
                <button
                  onClick={() => connectMetaMask().catch((e) => alert(e?.message || String(e)))}
                  className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--border-color)] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  title="Optional MetaMask (no GenLayer Snap required for writes)"
                >
                  <Wallet size={13} className="text-[var(--accent-cyan)]" />
                  MetaMask
                </button>
              ) : (
                <button
                  onClick={switchToDemo}
                  className="flex items-center gap-1.5 bg-[rgba(201,162,122,0.1)] hover:bg-[rgba(201,162,122,0.18)] border border-[var(--accent-purple)]/30 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  title="Demo Sandbox uses a local key"
                >
                  <FlaskConical size={13} className="text-[var(--accent-purple)]" />
                  Demo
                </button>
              )}

              <div className="flex items-center gap-1.5 bg-black/35 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    walletMode === "demo"
                      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)]"
                      : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]"
                  }`}
                  aria-hidden
                />
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{shortAddr}</span>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2.5 md:hidden">
            {account && (
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-[var(--border-color)]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    walletMode === "demo" ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                  {account.substring(0, 4)}…{account.substring(account.length - 4)}
                </span>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-colors min-h-11 min-w-11 flex items-center justify-center"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[rgba(7,11,18,0.96)] backdrop-blur-xl px-4 py-4 flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`w-full px-3 py-3 rounded-lg text-sm font-semibold transition-colors min-h-11 flex items-center ${
                  isActive(link.path)
                    ? "bg-[rgba(201,162,122,0.12)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[var(--border-color)] pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center px-3 text-xs">
              <span className="text-[var(--color-text-muted)] font-semibold">Balance</span>
              <span className="text-white font-bold tabular-nums">{balance}</span>
            </div>
            <div className="flex justify-between items-center px-3 text-xs">
              <span className="text-[var(--color-text-muted)] font-semibold">Mode</span>
              <span className={`font-bold ${walletMode === "demo" ? "text-amber-400" : "text-emerald-400"}`}>
                {walletMode === "demo" ? "Sandbox" : "MetaMask"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                disabled={walletMode === "metamask"}
                onClick={() => {
                  connectMetaMask().catch((e) => alert(e?.message || String(e)));
                  closeMenu();
                }}
                className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-lg text-xs font-bold transition-all border min-h-11 ${
                  walletMode === "metamask"
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 opacity-70"
                    : "bg-black/30 border-[var(--border-color)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <Wallet size={13} />
                MetaMask
              </button>

              <button
                disabled={walletMode === "demo"}
                onClick={() => {
                  switchToDemo();
                  closeMenu();
                }}
                className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-lg text-xs font-bold transition-all border min-h-11 ${
                  walletMode === "demo"
                    ? "bg-amber-500/10 border-amber-500/25 text-amber-400 opacity-70"
                    : "bg-black/30 border-[var(--border-color)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <Coins size={13} />
                Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
