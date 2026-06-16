# VowChain Interactive Demo Walkthrough

This guide walks you through testing VowChain inside the local sandbox environment.

---

## Prerequisite Setup

1.  **Launch Frontend:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.
2.  **Verify Demo Sandbox Mode:**
    *   Confirm that a glowing amber indicator is visible in the top-right corner of the Navbar, showing **Sandbox Account** and a generated address.
    *   If you are connected to MetaMask, click **Use Demo Mode** in the Navbar to activate the sandbox.

---

## Scenario 1 Walkthrough: Amicable Resolution

This scenario models a cooperative separation where both spouses agree to split assets proportionally based on deposit contributions (80/20).

1.  **Select Scenario:**
    *   Navigate to `/demo` (Interactive Demos).
    *   Locate **The Amicable Split** card.
2.  **Draft Vow (Partner A):**
    *   Click **Login: Alice (Earner)** to load Alice's credentials.
    *   Click **Claim 100 Demo GEN** in the Navbar header to top up Alice's wallet.
    *   Go to **Create Prenup** (`/create`).
    *   Autofill Partner B's address (Bob's address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`).
    *   Apply the template: **Proportional Financial Contribution**.
    *   Enter an initial deposit of `80` (Wei/GEN representation).
    *   Submit the transaction and **Copy the Agreement ID** generated on the success screen.
3.  **Join Vow (Partner B):**
    *   Go back to `/demo` and click **Login: Bob (Partner)** to swap accounts.
    *   Go to **Join Partner** (`/join`).
    *   Paste the copied Agreement ID.
    *   Enter a deposit of `20`.
    *   Click **Join & Activate Vow**.
4.  **Submit Evidence & Arbitrate:**
    *   Navigate to the Vow Dashboard (`/agreement/<id>`).
    *   Go to the **Evidence Panel** tab.
    *   Bob submits: `"I deposited 20 GEN bank statements verifying my contribution. http://vowchain.vercel.app/bob"` under category *Financial Income*.
    *   Swap accounts back to **Alice** on `/demo`.
    *   Navigate back to the Vow Dashboard and open the **Evidence Panel**.
    *   Alice submits: `"I deposited 80 GEN bank statements verifying my contribution. http://vowchain.vercel.app/alice"` under category *Financial Income*.
    *   Click **Run AI Arbitration Consensus**.
    *   Wait for the judges overlay. The proposal tab will unlock automatically.
5.  **Mutual Sign-off & Release:**
    *   Verify that the proposal pie chart displays an exact **80/20 split** with detailed reasoning.
    *   Alice clicks **Accept & Sign Split**.
    *   Swap accounts to **Bob** on `/demo`.
    *   Navigate back to the dashboard, open the proposal tab, and click **Accept & Sign Split**.
    *   The agreement status transitions to **SETTLED**.
6.  **Withdraw Assets:**
    *   Navigate to `/treasury`.
    *   Verify that the withdrawable balances are credited correctly.
    *   Click **Claim & Withdraw Funds** to claim your GEN tokens.
