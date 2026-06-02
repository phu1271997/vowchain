# VowChain — AI-Arbitrated Marriage Covenants on GenLayer

VowChain is a decentralized relationship and prenuptial agreement ("smart prenup") built using GenLayer Intelligent Contracts. It couples qualitative, natural-language marriage terms with secure, multi-judge LLM validator consensus, allowing partners to deposit assets and resolve separation splits objectively without adversarial courtroom battles.

> [!NOTE]
> **Why VowChain requires GenLayer:** Standard blockchains are strictly deterministic and cannot run non-deterministic LLMs, parse qualitative evidence, read external URLs, or evaluate natural-language contracts. GenLayer's unique consensus mechanism validates these subjective actions securely.

---

## 📖 Complete Documentation Suite

VowChain includes a comprehensive documentation suite covering the engineering and security specifications:

*   📂 **[ARCHITECTURE.md](file:///Users/peter/.gemini/antigravity/scratch/vowchain/docs/ARCHITECTURE.md):** Modular 3-contract system layout and asynchronous call sequence flow diagrams.
*   📂 **[ECONOMICS.md](file:///Users/peter/.gemini/antigravity/scratch/vowchain/docs/ECONOMICS.md):** Joint pool math, pull-withdrawal tokenomics, and the partner reputation system.
*   📂 **[SECURITY.md](file:///Users/peter/.gemini/antigravity/scratch/vowchain/docs/SECURITY.md):** Dynamic canary injection defense, delimiter structures, and consensus rounding bands.
*   📂 **[DEMO_GUIDE.md](file:///Users/peter/.gemini/antigravity/scratch/vowchain/docs/DEMO_GUIDE.md):** Complete sandbox step-by-step walkthrough to test scenarios in 1-Click Demo Mode.
*   📂 **[ETHICS.md](file:///Users/peter/.gemini/antigravity/scratch/vowchain/docs/ETHICS.md):** Ethical foundations, Family Law boundaries, and human-in-the-loop guardrails.

---

## 🏗️ Modular 3-Contract Architecture

VowChain splits execution into three dedicated intelligent contracts to prevent reentrancy, isolate states, and secure funds:

1.  **VowChain Core ([vowchain_core.py](file:///Users/peter/.gemini/antigravity/scratch/vowchain/contracts/vowchain_core.py)):** Manages agreement lifecycles (`CREATED`, `ACTIVE`, `DISSOLVING`, `ARBITRATING`, `PROPOSED`, `SETTLED`, `DEADLOCK`), evidence submissions, and dispute counts.
2.  **VowChain Arbitrator ([vowchain_arbitrator.py](file:///Users/peter/.gemini/antigravity/scratch/vowchain/contracts/vowchain_arbitrator.py)):** Evaluates evidence URLs, executes validator LLM prompts using comparative equivalency, and enforces canary token filters.
3.  **VowChain Treasury ([vowchain_treasury.py](file:///Users/peter/.gemini/antigravity/scratch/vowchain/contracts/vowchain_treasury.py)):** Houses locked assets, enforces state-guard modifiers, and exposes pull-withdrawal payouts.

---

## 🛠️ Installation & Testing

### 1. Python Contract Tests

Contracts are tested locally using a direct-testing VM environment.

```bash
# Install dependencies (genlayer-test and pytest)
pip install pytest genlayer-test

# Run the contract test suite (32 test cases)
pytest tests/
```

### 2. React Frontend

The React frontend utilizes Tailwind CSS v4, Framer Motion, and Recharts.

```bash
# Install packages
npm install

# Start the local Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser. By default, VowChain runs in **1-Click Demo Sandbox Mode** using local storage private keys, allowing you to try scenarios instantly without installing wallet extensions. Toggle **Go Pro Mode** in the Navbar to switch to MetaMask.
