# GenLayer Studio Deployment Guide: VowChain

Follow these instructions to compile, deploy, and link the modular VowChain contracts on GenLayer Studio.

---

## Deployment Sequence

Since the contracts reference each other, deploy them in this exact order and link their dependencies:

### 1. Deploy VowChainTreasury
*   Load the code of `contracts/vowchain_treasury.py` into the editor.
*   Click **Deploy**.
*   Note down the deployed **Treasury Contract Address**.

### 2. Deploy VowChainArbitrator
*   Load the code of `contracts/vowchain_arbitrator.py` into the editor.
*   Click **Deploy**.
*   Note down the deployed **Arbitrator Contract Address**.

### 3. Deploy VowChainCore
*   Load the code of `contracts/vowchain_core.py` into the editor.
*   Click **Deploy**.
*   Note down the deployed **Core Contract Address**.

### 4. Link Dependencies
To lock down authorization guards, execute these linking transactions:

1.  **Link Core to Treasury:**
    *   Select the deployed **VowChainTreasury** contract.
    *   Call the write method `set_core_address` passing the **Core Contract Address** as the argument.
2.  **Link Dependencies to Core:**
    *   Select the deployed **VowChainCore** contract.
    *   Call the write method `set_dependencies` passing the **Treasury Contract Address** and **Arbitrator Contract Address** as arguments.

---

## Post-Deployment Validation

Verify that your deployment is correctly linked by calling the following read-only methods:
*   On **VowChainTreasury**: Call `core_address()` to verify it matches the Core address.
*   On **VowChainCore**: Call `treasury_address()` and `arbitrator_address()` to confirm matches.
*   Update your frontend `.env` config with the new contract addresses:
    ```env
    VITE_VOWCHAIN_CORE_ADDRESS="<Core_Address>"
    VITE_VOWCHAIN_TREASURY_ADDRESS="<Treasury_Address>"
    ```
