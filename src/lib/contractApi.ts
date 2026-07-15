import { readClient, getWriteClient, rethrowWalletError, config } from "./genlayerClient";
import type { Agreement, Proposal } from "./types";
import { TransactionStatus } from "genlayer-js/types";

const ZERO = "0x0000000000000000000000000000000000000000";

// Contract addresses — set via Vercel / .env after Studio deploy
export const CORE_CONTRACT_ADDRESS = (import.meta.env.VITE_VOWCHAIN_CORE_ADDRESS ||
  ZERO) as `0x${string}`;
export const TREASURY_CONTRACT_ADDRESS = (import.meta.env
  .VITE_VOWCHAIN_TREASURY_ADDRESS || ZERO) as `0x${string}`;

export function isCoreConfigured(): boolean {
  return (
    Boolean(CORE_CONTRACT_ADDRESS) &&
    CORE_CONTRACT_ADDRESS.toLowerCase() !== ZERO.toLowerCase() &&
    CORE_CONTRACT_ADDRESS.length === 42
  );
}

export function requireCoreAddress(): `0x${string}` {
  if (!isCoreConfigured()) {
    throw new Error(
      "VowChain core contract is not configured. Set VITE_VOWCHAIN_CORE_ADDRESS to the deployed contracts/vowchain_core.py address and redeploy the frontend."
    );
  }
  return CORE_CONTRACT_ADDRESS;
}

export async function waitForTxReceipt(
  writeClient: any,
  hash: `0x${string}`,
  interval = 3000,
  retries = 40
) {
  return await writeClient.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval,
    retries,
  });
}

async function write(
  signerAccount: any,
  functionName: string,
  args: any[],
  value: bigint,
  onProgress: (msg: string) => void,
  progressLabel: string
) {
  const address = requireCoreAddress();
  try {
    // Never call writeClient.connect() — that triggers wallet_getSnaps / GenLayer Snap.
    const writeClient = getWriteClient(signerAccount);
    onProgress(progressLabel);
    const txHash = (await writeClient.writeContract({
      address,
      functionName,
      args,
      value,
    })) as `0x${string}`;

    onProgress("Waiting for GenLayer consensus / finalization...");
    await waitForTxReceipt(writeClient, txHash);
    return txHash;
  } catch (err) {
    rethrowWalletError(err);
  }
}

// ==========================================
// VowChainCore Reads
// ==========================================

export async function getAgreementCounter(): Promise<bigint> {
  if (!isCoreConfigured()) return 0n;
  try {
    const res = await readClient.readContract({
      address: CORE_CONTRACT_ADDRESS,
      functionName: "get_agreement_counter",
      args: [],
    });
    return BigInt(String(res));
  } catch (err) {
    console.error("Failed to read agreement counter:", err);
    return 0n;
  }
}

export async function healthCheck(): Promise<{ ok: boolean; message: string }> {
  if (!isCoreConfigured()) {
    return {
      ok: false,
      message:
        "VITE_VOWCHAIN_CORE_ADDRESS is not set — create agreement will fail until the core contract is configured.",
    };
  }
  try {
    const count = await getAgreementCounter();
    return {
      ok: true,
      message: `GenLayer binding OK · ${config.networkLabel} · get_agreement_counter() = ${count}`,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || String(err),
    };
  }
}

export async function getAgreement(agreementId: string): Promise<Agreement> {
  requireCoreAddress();
  const res = await readClient.readContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "get_agreement",
    args: [agreementId],
  });

  const parsed = JSON.parse(res as string);
  return {
    ...parsed,
    pool: BigInt(parsed.pool || 0),
    deposit_a: BigInt(parsed.deposit_a || 0),
    deposit_b: BigInt(parsed.deposit_b || 0),
    dispute_count: Number(parsed.dispute_count || 0),
    dispute_cooldown: Number(parsed.dispute_cooldown || 0),
  };
}

export async function getProposal(agreementId: string): Promise<Proposal | null> {
  try {
    requireCoreAddress();
    const res = await readClient.readContract({
      address: CORE_CONTRACT_ADDRESS,
      functionName: "get_proposal",
      args: [agreementId],
    });
    return JSON.parse(res as string) as Proposal;
  } catch {
    return null;
  }
}

// ==========================================
// VowChainCore Writes
// ==========================================

export async function createAgreement(
  signerAccount: any,
  partnerB: string,
  terms: string,
  depositWei: bigint,
  onProgress: (msg: string) => void
): Promise<string> {
  if (!partnerB?.startsWith("0x") || partnerB.length !== 42) {
    throw new Error("Partner B must be a valid 0x-prefixed 40-hex-character address.");
  }
  if (!terms?.trim()) {
    throw new Error("Separation terms cannot be empty.");
  }

  await write(
    signerAccount,
    "create_agreement",
    [partnerB, terms],
    depositWei,
    onProgress,
    "Broadcasting create_agreement (no MetaMask Snap / no client.connect)..."
  );

  onProgress("Fetching new agreement ID...");
  // Small delay for view consistency after finalize
  await new Promise((r) => setTimeout(r, 800));
  const counter = await getAgreementCounter();
  if (counter === 0n) {
    // Fallback: still return best-effort id
    return "1";
  }
  return String(counter);
}

export async function joinAgreement(
  signerAccount: any,
  agreementId: string,
  depositWei: bigint,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "join_agreement",
    [agreementId],
    depositWei,
    onProgress,
    "Broadcasting join_agreement..."
  );
}

export async function initiateDissolution(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "initiate_dissolution",
    [agreementId],
    0n,
    onProgress,
    "Broadcasting initiate_dissolution..."
  );
}

export async function submitEvidence(
  signerAccount: any,
  agreementId: string,
  evidence: string,
  category: string,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "submit_evidence",
    [agreementId, evidence, category],
    0n,
    onProgress,
    "Broadcasting submit_evidence..."
  );
}

export async function proposeSplit(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "propose_split",
    [agreementId],
    0n,
    onProgress,
    "Initiating AI arbitration consensus (propose_split)..."
  );
}

export async function acceptProposal(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "accept_proposal",
    [agreementId],
    0n,
    onProgress,
    "Signing accept_proposal..."
  );
}

export async function disputeProposal(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "dispute_proposal",
    [agreementId],
    0n,
    onProgress,
    "Filing dispute_proposal..."
  );
}

export async function settleDeadlock(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  await write(
    signerAccount,
    "settle_deadlock",
    [agreementId],
    0n,
    onProgress,
    "Signing settle_deadlock..."
  );
}

// ==========================================
// VowChainTreasury
// ==========================================

export async function getWithdrawableBalance(address: string): Promise<bigint> {
  if (TREASURY_CONTRACT_ADDRESS === ZERO) return 0n;
  try {
    const res = await readClient.readContract({
      address: TREASURY_CONTRACT_ADDRESS,
      functionName: "get_withdrawable",
      args: [address],
    });
    return BigInt(String(res));
  } catch (err) {
    console.error("Failed to read withdrawable balance:", err);
    return 0n;
  }
}

export async function withdrawFunds(
  signerAccount: any,
  onProgress: (msg: string) => void
): Promise<bigint> {
  if (TREASURY_CONTRACT_ADDRESS === ZERO) {
    throw new Error("Treasury contract address is not configured.");
  }
  try {
    const writeClient = getWriteClient(signerAccount);
    onProgress("Initiating pull withdrawal...");
    const txHash = (await writeClient.writeContract({
      address: TREASURY_CONTRACT_ADDRESS,
      functionName: "withdraw",
      args: [],
      value: 0n,
    })) as `0x${string}`;
    onProgress("Finalizing value transfer on GenLayer...");
    await waitForTxReceipt(writeClient, txHash);
    return 0n;
  } catch (err) {
    rethrowWalletError(err);
  }
}

export async function getPartnerReputation(address: string): Promise<number> {
  if (!isCoreConfigured()) return 0;
  try {
    const res = await readClient.readContract({
      address: CORE_CONTRACT_ADDRESS,
      functionName: "get_reputation",
      args: [address],
    });
    return Number(res);
  } catch (err) {
    console.error("Failed to read reputation:", err);
    return 0;
  }
}

export { CORE_CONTRACT_ADDRESS as coreAddressExport };
