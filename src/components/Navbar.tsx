import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Scale, Wallet, Coins } from "lucide-react";
import { useWallet } from "../lib/walletContext";

export const Navbar: React.FC = () => {
  const { account, walletMode, balance, connectMetaMask, switchToDemo } = useWallet();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Scale className="h-7 w-7 text-[var(--accent-purple)] group-hover:scale-110 transition-transform" />
                <Heart className="h-4.5 w-4.5 text-[var(--accent-pink)] absolute -bottom-1 -right-1 group-hover:scale-125 transition-transform fill-[var(--accent-pink)]" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-white bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
                  VowChain
                </span>
                <span className="hidden sm:block text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase font-semibold">
                  AI-Arbitrated Prenup
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/create"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/create")
                    ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                Create Prenup
              </Link>
              <Link
                to="/join"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/join")
                    ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                Join Partner
              </Link>
              <Link
                to="/demo"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/demo")
                    ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                Interactive Demos
              </Link>
              <Link
                to="/treasury"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/treasury")
                    ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                Treasury
              </Link>
              <Link
                to="/ethics"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/ethics")
                    ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                Ethics & Safety
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet Info / Mode Selector */}
            <div className="flex items-center gap-2 bg-[rgba(27,8,14,0.4)] border border-[var(--border-color)] rounded-xl p-1.5 pl-3">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-[11px] text-[var(--color-text-muted)] font-semibold uppercase">
                  {walletMode === "demo" ? "Sandbox Account" : "MetaMask Pro"}
                </span>
                <span className="text-xs font-bold text-white tracking-wide">{balance}</span>
              </div>
              
              <div className="h-6 w-px bg-[var(--border-color)] hidden lg:block" />

              {walletMode === "demo" ? (
                <button
                  onClick={() => connectMetaMask().catch((e) => alert(e?.message || String(e)))}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[#e2a76f]/10 to-[#b76e79]/10 hover:from-[#e2a76f]/20 hover:to-[#b76e79]/20 border border-[#b76e79]/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  title="Optional MetaMask (no GenLayer Snap required for writes)"
                >
                  <Wallet size={13} className="text-[#e2a76f]" />
                  <span>MetaMask</span>
                </button>
              ) : (
                <button
                  onClick={switchToDemo}
                  className="flex items-center gap-1.5 bg-[rgba(183,110,121,0.1)] hover:bg-[rgba(183,110,121,0.2)] border border-[var(--accent-purple)]/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  title="Demo Sandbox uses a local key — recommended (avoids wallet_getSnaps)"
                >
                  <Coins size={13} className="text-[var(--accent-purple)]" />
                  <span>Demo Sandbox</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)]">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    walletMode === "demo"
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"
                      : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  }`}
                />
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
