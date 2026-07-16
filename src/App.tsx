import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Scale, Github, Shield } from "lucide-react";
import { WalletProvider } from "./lib/walletContext";
import { Navbar } from "./components/Navbar";

import { HomePage } from "./pages/HomePage";
import { CreateAgreementPage } from "./pages/CreateAgreementPage";
import { JoinAgreementPage } from "./pages/JoinAgreementPage";
import { AgreementDetailPage } from "./pages/AgreementDetailPage";
import { DisputePage } from "./pages/DisputePage";
import { DemoGalleryPage } from "./pages/DemoGalleryPage";
import { TreasuryPage } from "./pages/TreasuryPage";
import { ReputationPage } from "./pages/ReputationPage";
import { EthicsPage } from "./pages/EthicsPage";

export default function App() {
  return (
    <Router>
      <WalletProvider>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--color-text-primary)] flex flex-col relative overflow-x-hidden font-body">
          <div className="bg-blobs pointer-events-none" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>

          <Navbar />

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                borderColor: "var(--border-color)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-body)",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
              },
            }}
          />

          <main className="flex-grow z-10 relative">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateAgreementPage />} />
              <Route path="/join" element={<JoinAgreementPage />} />
              <Route path="/agreement/:id" element={<AgreementDetailPage />} />
              <Route path="/agreement/:id/dispute" element={<DisputePage />} />
              <Route path="/demo" element={<DemoGalleryPage />} />
              <Route path="/treasury" element={<TreasuryPage />} />
              <Route path="/reputation" element={<ReputationPage />} />
              <Route path="/reputation/:address" element={<ReputationPage />} />
              <Route path="/ethics" element={<EthicsPage />} />
            </Routes>
          </main>

          <footer className="site-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
                      <Scale size={16} className="text-[#0c0a09]" />
                    </div>
                    <span className="font-heading font-bold text-base text-white tracking-tight">
                      VowChain
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
                    AI-arbitrated marriage covenants on GenLayer. Natural-language prenups with multi-validator consensus.
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-left md:items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                    Product
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-text-secondary)] md:justify-center">
                    <Link to="/create" className="hover:text-white transition-colors">
                      Create Prenup
                    </Link>
                    <Link to="/demo" className="hover:text-white transition-colors">
                      Demo
                    </Link>
                    <Link to="/treasury" className="hover:text-white transition-colors">
                      Treasury
                    </Link>
                    <Link to="/reputation" className="hover:text-white transition-colors">
                      Reputation
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-left md:items-end">
                  <div className="flex items-center gap-3">
                    <Link
                      to="/ethics"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
                    >
                      <Shield size={14} />
                      Ethics
                    </Link>
                    <a
                      href="https://github.com/phu1271997/vowchain"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
                    >
                      <Github size={14} />
                      GitHub
                    </a>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    © 2026 VowChain · Built for GenLayer Builder Program
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </WalletProvider>
    </Router>
  );
}
