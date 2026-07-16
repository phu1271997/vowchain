import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Scale, Wallet, Coins, Menu, X } from "lucide-react";
import { useWallet } from "../lib/walletContext";

export const Navbar: React.FC = () => {
  const { account, walletMode, balance, connectMetaMask, switchToDemo } = useWallet();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { path: "/create", label: "Create Prenup" },
    { path: "/join", label: "Join Partner" },
    { path: "/demo", label: "Interactive Demos" },
    { path: "/treasury", label: "Treasury" },
    { path: "/ethics", label: "Ethics & Safety" },
  ];

  return (
    <nav className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group">
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                      : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Side: Wallet details */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile Right Side: Compact Connection Status & Hamburger Icon */}
          <div className="flex items-center gap-3 md:hidden">
            {account && (
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
                <div
                  className={`h-2 w-2 rounded-full ${
                    walletMode === "demo" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  }`}
                />
                <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                  {account.substring(0, 4)}...{account.substring(account.length - 4)}
                </span>
              </div>
            )}
            
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-lg px-4 py-4 flex flex-col gap-4 animate-fade-in">
          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? "bg-[rgba(183,110,121,0.15)] text-[var(--accent-purple)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet management panel in Drawer */}
          <div className="border-t border-[var(--border-color)]/50 pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center px-3 text-xs">
              <span className="text-[var(--color-text-muted)] font-semibold">Wallet Balance</span>
              <span className="text-white font-bold">{balance}</span>
            </div>
            
            <div className="flex justify-between items-center px-3 text-xs">
              <span className="text-[var(--color-text-muted)] font-semibold">Security Mode</span>
              <span className={`font-bold ${walletMode === "demo" ? "text-amber-400" : "text-emerald-400"}`}>
                {walletMode === "demo" ? "Sandbox Account" : "MetaMask Mode"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                disabled={walletMode === "metamask"}
                onClick={() => {
                  connectMetaMask().catch((e) => alert(e?.message || String(e)));
                  closeMenu();
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                  walletMode === "metamask"
                    ? "bg-[rgba(16,185,129,0.1)] border-emerald-500/20 text-emerald-400 opacity-60"
                    : "bg-black/30 border-[var(--border-color)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <Wallet size={12} />
                <span>MetaMask</span>
              </button>

              <button
                disabled={walletMode === "demo"}
                onClick={() => {
                  switchToDemo();
                  closeMenu();
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                  walletMode === "demo"
                    ? "bg-[rgba(245,158,11,0.1)] border-amber-500/20 text-amber-400 opacity-60"
                    : "bg-black/30 border-[var(--border-color)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <Coins size={12} />
                <span>Demo Sandbox</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
