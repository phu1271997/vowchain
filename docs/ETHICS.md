# Ethical & Legal Foundations: VowChain

Matrimonial disputes and relationship dissolution involve highly sensitive financial, legal, and emotional parameters. VowChain leverage consensus-based AI models on the GenLayer network to assist partners in property division, but establishes strict ethical boundaries and technical mitigations to protect users.

---

## 1. Legal Boundaries & Advisor Role

*   **No Legal Advice:** The VowChain contract code, prompt parameters, and output recommendations do not constitute legal advice. AI arbitration is intended as a neutral "fairness assist" tool to help partners discover common ground, not to replace qualified family law attorneys.
*   **Enforceability:** matromonial laws differ drastically by city, country, and state. In many jurisdictions, prenuptial agreements have strict statutory requirements (such as independent legal representation for both parties, full financial disclosure, and written notary signatures) to be legally enforceable in court. VowChain cannot guarantee enforceability in municipal courts.

---

## 2. Technical Mitigation of AI Vulnerabilities

Because LLMs can experience hallucinations or be subject to manipulation, VowChain implements multiple layers of defense:

1.  **Double-Consent Sign-off:** The contract does **not** perform autonomous transfers of funds based solely on AI outputs. The proposed split is strictly advisory. Assets are only moved when both partners explicitly sign off on the split by calling `accept_proposal()`.
2.  **Canary Token Guardrails:** Since partners have direct financial motives to manipulate the AI, evidence input strings are isolated. Unique canary tokens check that evidence inputs do not bypass system instructions or alter split weights.
3.  **10% Rounding Bands:** To prevent slight discrepancies in decimals or wording from stalling the consensus mechanism, validators only verify and agree upon a rounded 10% band (e.g. 50/50, 60/40) instead of an exact decimal float.

---

## 3. Disputation and Escalation Path

If either partner feels the AI-proposed split is unfair or inaccurate:
1. They can call `dispute_proposal()` to immediately reset the agreement state back to `DISSOLVING`.
2. This allows partners to submit further supporting documents or clarification statements.
3. If agreement cannot be reached on-chain, partners must escalate the matter to traditional legal mediation. The assets remain locked in the contract until mutual agreement or off-chain court resolution directs a settlement.
