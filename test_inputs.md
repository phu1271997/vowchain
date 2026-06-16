# VowChain Step-by-Step Test Sequence Walkthrough

This document outlines a complete execution path for testing VowChain on GenLayer Studio, simulating a dissolution between a financial-heavy partner and a caregiving-heavy partner.

---

## Test Scenario Setup

*   **Partner A (Financial-Heavy):** Address `0x1111111111111111111111111111111111111111`
*   **Partner B (Caregiving-Heavy):** Address `0x2222222222222222222222222222222222222222`
*   **Prenuptial Separation Terms:** *"Assets should be split fairly according to each partner's financial and non-financial contribution. Non-financial contributions (such as child rearing, home management, and career support) must be valued equally to career earnings during the marriage."*

---

## Transaction Step Sequence

### Step 1: Create Agreement (Called by Partner A)
*   **Caller Address:** `0x1111111111111111111111111111111111111111` (Partner A)
*   **Method:** `create_agreement`
*   **Transaction Value (Wei/Cents):** `80000` (e.g., 80% of total pool)
*   **Arguments:**
    ```json
    {
      "partner_b_addr": "0x2222222222222222222222222222222222222222",
      "separation_terms": "Assets should be split fairly according to each partner's financial and non-financial contribution. Non-financial contributions (such as child rearing, home management, and career support) must be valued equally to career earnings during the marriage."
    }
    ```
*   **Expected Return Value:** `"1"` (The first generated `agreement_id`).

### Step 2: Join Agreement (Called by Partner B)
*   **Caller Address:** `0x2222222222222222222222222222222222222222` (Partner B)
*   **Method:** `join_agreement`
*   **Transaction Value (Wei/Cents):** `20000` (e.g., 20% of total pool)
*   **Arguments:**
    ```json
    {
      "agreement_id": "1"
    }
    ```
*   **State Impact:** Agreement pool becomes `100000`, `deposit_a = 80000`, `deposit_b = 20000`.

### Step 3: Initiate Dissolution (Called by either Partner)
*   **Caller Address:** `0x1111111111111111111111111111111111111111`
*   **Method:** `initiate_dissolution`
*   **Arguments:**
    ```json
    {
      "agreement_id": "1"
    }
    ```
*   **State Impact:** Agreement status transitions to `"DISSOLVING"`.

### Step 4: Submit Evidence (Partner A - Financial Heavy)
*   **Caller Address:** `0x1111111111111111111111111111111111111111` (Partner A)
*   **Method:** `submit_evidence`
*   **Arguments:**
    ```json
    {
      "agreement_id": "1",
      "evidence": "I deposited 80,000 wei (80% of total assets). I worked full-time as a lead software engineer, earning $150,000/year to pay for rent and utilities. Refer to bank balance summary at: https://raw.githubusercontent.com/genlayer/dummy-bank-records/main/summary.html"
    }
    ```

### Step 5: Submit Evidence (Partner B - Caregiving Heavy)
*   **Caller Address:** `0x2222222222222222222222222222222222222222` (Partner B)
*   **Method:** `submit_evidence`
*   **Arguments:**
    ```json
    {
      "agreement_id": "1",
      "evidence": "I put my career on hold to manage our home and raise our two children full-time, enabling Partner A to work long hours and advance their engineering career. I contributed $20,000 from savings. I cooked, cleaned, managed household logistics, and supported the family on a daily basis."
    }
    ```

### Step 6: Propose Split (Intelligent Arbitration Run)
*   **Caller Address:** Any address (this is a public write transaction)
*   **Method:** `propose_split`
*   **Arguments:**
    ```json
    {
      "agreement_id": "1"
    }
    ```

#### Expected Qualitative Outcome:
1. The leader and validators render the URL in A's evidence, extracting any quantitative or text data.
2. The LLM processes the natural language terms: *"Non-financial contributions (such as child rearing...) must be valued equally to career earnings"*.
3. Despite Partner A depositing 80% of the funds, the LLM weighs Partner B's child-rearing and homemaking labor against A's career earnings.
4. Rather than recommending an 80/20 split based strictly on deposit quantities, the LLM evaluates the qualitative labor, outputting a fair proposal (typically **50/50** or **60/40** split).
5. Output JSON returns the proposed split and reasoning. Status is updated to `"PROPOSED"`.

### Step 7: Accept Proposal (Called by BOTH partners)

#### Substep 7a: Accept (Partner A)
*   **Caller Address:** `0x1111111111111111111111111111111111111111`
*   **Method:** `accept_proposal`
*   **Arguments:**
    ```json
    {
      "agreement_id": "1"
    }
    ```

#### Substep 7b: Accept (Partner B)
*   **Caller Address:** `0x2222222222222222222222222222222222222222`
*   **Method:** `accept_proposal`
*   **Arguments:**
    ```json
    {
      "agreement_id": "1"
    }
    ```

*   **Final Output:** Once both call `accept_proposal`, the contract changes state to `"SETTLED"`. It executes EVM transfers releasing `total_pool * proposed_split / 100` back to each partner's address automatically.
