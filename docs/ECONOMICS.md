# VowChain Tokenomics & Economics

VowChain implements game-theoretic and security-centric economic models to ensure joint pool safety, prevent reentrancy attacks, and incentivize amicable dispute resolution.

---

## 1. Joint Asset Pooling

*   **Initialization:** Partner A creates the agreement vow and optionally deposits assets (`deposit_a`).
*   **Activation:** Partner B joins the draft and deposits their contribution (`deposit_b`). The contract sums these contributions into the joint asset pool:
    \[\text{Total Pool} = \text{Deposit A} + \text{Deposit B}\]
*   **Locking:** Once the status transitions to `ACTIVE`, all deposits are locked. No funds can be withdrawn by either party until dissolution is declared, arbitrated, and mutually signed off.

---

## 2. Pull-Withdrawal Tokenomics

To guard against reentrancy and out-of-gas exploits during payout execution, VowChain splits asset allocation and asset withdrawal into separate steps:

1.  **Mutual Acceptance:** When both partners sign the proposed split, the Core contract divides the pool:
    \[\text{Share A} = \text{Total Pool} \times \text{Split A}\%\]
    \[\text{Share B} = \text{Total Pool} - \text{Share A}\]
2.  **Credit Allocation:** The Core contract calls the Treasury to credit these shares:
    ```python
    treasury.deposit_share(partner_a) # with Value = Share A
    treasury.deposit_share(partner_b) # with Value = Share B
    ```
3.  **Claim Withdrawal:** Spouses must manually withdraw their balance by invoking `withdraw()` on the Treasury:
    ```python
    withdrawable = withdrawable_balances[sender]
    withdrawable_balances[sender] = 0
    sender.transfer(withdrawable)
    ```

This ensures that a malicious partner cannot block the other partner's withdrawal by writing a contract that rejects incoming ether.

---

## 3. Partner Reputation Incentives

On-chain reputation scores incentivize partners to cooperate and settle relationships in good faith:

*   **Initial Standing:** All addresses start with a neutral reputation score of `0`.
*   **Amicable Settlement Bonus:**
    *   If settled on the **1st proposal** (no disputes):
        \[\Delta \text{Reputation} = +2\]
    *   If settled on the **2nd or 3rd proposal**:
        \[\Delta \text{Reputation} = +1\]
*   **Dispute Penalty:** Filing a split dispute indicates a failure to cooperate, invoking:
    \[\Delta \text{Reputation} = -1\]
*   **Security Penalties:** Attempting prompt injection or canary leaks results in a severe manual reputation markdown.

### Reputation Standings Tiers

Reputation scores map to visible tier ratings displayed inside lookup profiles:

| Reputation Score | Standing Tier | Visual Theme |
| :--- | :--- | :--- |
| \(\le -2\) | Penalized Tier | Rose (Soft Red) |
| \(-1 \text{ to } 0\) | Standard Tier | Zinc (Muted Gray) |
| \(1 \text{ to } 2\) | Bronze Standings | Copper Bronze |
| \(3 \text{ to } 4\) | Silver Standings | Muted Slate/Silver |
| \(5 \text{ to } 7\) | Gold Tier | Champagne Gold |
| \(\ge 8\) | Platinum Guardian | Vibrant Rose Gold |
