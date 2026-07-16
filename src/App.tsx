import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Scale } from "lucide-react";
import { WalletProvider } from "./lib/walletContext";
import { Navbar } from "./components/Navbar";

// Pages
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
          
          {/* Ambient Blob Background */}
          <div className="bg-blobs pointer-events-none">
            <div className="blob blob-1 absolute rounded-full filter blur-[100px] opacity-15" />
            <div className="blob blob-2 absolute rounded-full filter blur-[100px] opacity-15" />
            <div className="blob blob-3 absolute rounded-full filter blur-[100px] opacity-10" />
          </div>

          {/* Navigation */}
          <Navbar />

          {/* Global Toast Notifier */}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-body)",
              }
            }}
          />

          {/* Main Content Page Container */}
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

          {/* Footer */}
          <footer className="border-t border-[var(--border-color)] bg-black/40 py-8 text-center text-xs text-[var(--color-text-muted)] z-10 relative">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-1.5 font-heading font-extrabold text-sm text-white">
                <Scale size={16} className="text-[var(--accent-purple)]" />
                <span>VowChain</span>
              </div>
              <p>
                © 2026 VowChain. Built for GenLayer Builder Program. Intelligent family-law covenants.
              </p>
              <div className="flex gap-4">
                <Link to="/ethics" className="hover:text-white transition-colors">Ethics</Link>
                <a 
                  href="https://github.com/phu1271997/vowchain" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </footer>

        </div>
      </WalletProvider>
    </Router>
  );
}
