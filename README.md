# 💍 VowChain — AI-Arbitrated Marriage Covenants on GenLayer

> _"What if divorce didn't require lawyers, just validators?"_

VowChain is a first-of-its-kind **decentralized prenuptial agreement platform** powered by [GenLayer](https://genlayer.com) Intelligent Contracts. Partners jointly create natural-language marriage covenants, deposit shared assets, and — if dissolution is ever needed — receive **AI-arbitrated fair splits** through multi-validator LLM consensus.

[![Live Demo](https://img.shields.io/badge/Live_Demo-vowchain.vercel.app-b76e79?style=for-the-badge&logo=vercel)](https://vowchain.vercel.app)
[![GenLayer](https://img.shields.io/badge/Built_on-GenLayer-722f37?style=for-the-badge)](https://genlayer.com)
[![Tests](https://img.shields.io/badge/Tests-40+_Cases-3d8b7a?style=for-the-badge)](./tests/)

---

## 🧠 Why VowChain Dies Without GenLayer

| Capability | Traditional Blockchain | GenLayer |
|---|---|---|
| Parse natural-language prenup terms | ❌ Deterministic only | ✅ LLM execution in validators |
| Read evidence URLs (bank statements, therapy notes) | ❌ No web access | ✅ `gl.get_webpage()` |
| Evaluate subjective fairness (who contributed more?) | ❌ Only binary logic | ✅ `gl.eq_principle.prompt_comparative` |
| Multi-judge consensus on qualitative splits | ❌ Single computation | ✅ Validator network with equivalence principle |
| Detect prompt injection in evidence | ❌ N/A | ✅ Canary token defense in GenVM |

**VowChain is impossible on Ethereum, Solana, or any other chain.** Only GenLayer's non-deterministic consensus can arbitrate subjective human disputes.

---

## 🏗️ Modular 3-Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                 │
│          Demo Sandbox Mode  │  MetaMask Pro Mode        │
└──────────────────┬──────────┴───────────────────────────┘
                   │ genlayer-js SDK
    ┌──────────────┼──────────────────────┐
    │              │                      │
    ▼              ▼                      ▼
┌────────┐   ┌──────────┐   ┌────────────────┐
│Treasury│◄──│   Core   │──►│  Arbitrator    │
│        │   │          │   │                │
│• Pools │   │• Lifecycle│  │• LLM Prompts   │
│• Pull  │   │• Evidence │  │• URL Parsing   │
│  Withdraw│ │• Disputes │  │• Canary Defense│
│• Guards│   │• Reputation│ │• Consensus     │
└────────┘   └──────────┘   └────────────────┘
```

### Contracts

| Contract | Purpose | Key Innovation |
|---|---|---|
| **[vowchain_core.py](contracts/vowchain_core.py)** | Agreement lifecycle orchestrator | 7-state FSM with cooldown timers, evidence categories, partner reputation |
| **[vowchain_arbitrator.py](contracts/vowchain_arbitrator.py)** | Non-deterministic split computation | `gl.eq_principle.prompt_comparative` with canary tokens for injection defense |
| **[vowchain_treasury.py](contracts/vowchain_treasury.py)** | Secure fund management | Pull-withdrawal pattern, state-guard modifiers, reentrancy protection |

---

## ✨ Features

### 🔐 Smart Prenup Creation
- Multi-step wizard with **natural language term templates**
- Partner address validation, deposit tracking, QR code sharing

### ⚖️ AI Arbitration Engine
- Submit categorized evidence (Financial, Caregiving, Professional, etc.)
- Each partner provides up to 5 evidence URLs
- **Multi-validator LLM consensus** evaluates qualitative contributions
- 10% consensus banding prevents adversarial gaming

### 🛡️ Security Guardrails
- **Dynamic canary token injection** to detect prompt manipulation
- **Double-consent requirement** — both partners must accept any proposed split
- **3-strike deadlock protection** with mandatory mediation fallback
- **Pull-withdrawal model** prevents locked fund exploits

### 🎭 1-Click Demo Sandbox
- No MetaMask required — instant exploration with localStorage keys
- 3 pre-seeded scenarios: Amicable, Disputed, and Complex
- Hot-swap between Partner A and Partner B perspectives

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (for contract tests)

### Frontend
```bash
git clone https://github.com/phu1271997/vowchain.git
cd vowchain
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) — Demo Mode activates automatically.

### Contract Tests
```bash
pip install pytest genlayer-test
pytest tests/ -v
```

---

## 📂 Project Structure

```
vowchain/
├── contracts/                 # GenLayer Intelligent Contracts (v0.2.16)
│   ├── vowchain_core.py       # Lifecycle orchestrator
│   ├── vowchain_arbitrator.py # LLM consensus engine
│   └── vowchain_treasury.py   # Fund management
├── tests/                     # 40+ pytest test cases
│   ├── conftest.py            # Mock GenVM fixtures
│   ├── test_create_agreement.py
│   ├── test_join_agreement.py
│   ├── test_dissolution_lifecycle.py
│   ├── test_propose_split_consensus.py
│   ├── test_dispute_deadlock.py
│   ├── test_treasury_solvency.py
│   ├── test_prompt_injection.py
│   └── test_edge_cases.py
├── src/                       # React + TypeScript Frontend
│   ├── pages/                 # 9 distinct views
│   ├── components/            # Reusable UI components
│   └── lib/                   # Web3 client, wallet, API
├── docs/                      # Documentation suite
│   ├── ARCHITECTURE.md
│   ├── ECONOMICS.md
│   ├── SECURITY.md
│   ├── DEMO_GUIDE.md
│   └── ETHICS.md
└── DEPLOY.md                  # Deployment instructions
```

---

## 📖 Documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 3-contract modular design, sequence diagrams |
| [ECONOMICS.md](docs/ECONOMICS.md) | Deposit math, reputation system, tokenomics |
| [SECURITY.md](docs/SECURITY.md) | Canary token defense, prompt injection mitigation |
| [DEMO_GUIDE.md](docs/DEMO_GUIDE.md) | Step-by-step sandbox walkthrough |
| [ETHICS.md](docs/ETHICS.md) | AI limitations, bias mitigation, legal boundaries |
| [DEPLOY.md](DEPLOY.md) | Vercel + GenLayer testnet deployment guide |

---

## 🤝 Ethical Design

VowChain is designed as a **mediation aid**, not a replacement for legal counsel. The AI arbitrator:
- ✅ Suggests split percentages based on submitted evidence
- ✅ Requires **both partners' consent** before any funds are released
- ✅ Supports dispute and re-arbitration workflows
- ❌ Does **not** make legally binding determinations
- ❌ Does **not** access private information without explicit submission

See [ETHICS.md](docs/ETHICS.md) for our complete ethical framework.

---

## 📄 License

MIT © 2026 VowChain. Built for the [GenLayer Builder Program](https://genlayer.com).
