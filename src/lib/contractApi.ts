import { readClient, getWriteClient } from "./genlayerClient";
import type { Agreement, Proposal } from "./types";
import { TransactionStatus } from "genlayer-js/types";

// Fallback contract addresses (to be updated after deployment)
export const CORE_CONTRACT_ADDRESS = (import.meta.env.VITE_VOWCHAIN_CORE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const TREASURY_CONTRACT_ADDRESS = (import.meta.env.VITE_VOWCHAIN_TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Helper to wait for transaction finalization
export async function waitForTxReceipt(writeClient: any, hash: `0x${string}`, interval = 3000, retries = 25) {
  return await writeClient.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval,
    retries,
  });
}

// ==========================================
// VowChainCore Reads
// ==========================================

export async function getAgreementCounter(): Promise<bigint> {
  if (CORE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") return 0n;
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

export async function getAgreement(agreementId: string): Promise<Agreement> {
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
    const res = await readClient.readContract({
      address: CORE_CONTRACT_ADDRESS,
      functionName: "get_proposal",
      args: [agreementId],
    });
    return JSON.parse(res as string) as Proposal;
  } catch (err) {
    // If status is not PROPOSED or SETTLED, get_proposal will revert on contract
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
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Broadcasting agreement creation transaction...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "create_agreement",
    args: [partnerB, terms],
    value: depositWei,
  });

  onProgress("Waiting for validator consensus on GenLayer...");
  await waitForTxReceipt(writeClient, txHash);

  onProgress("Fetching new agreement ID...");
  const counter = await getAgreementCounter();
  return String(counter);
}

export async function joinAgreement(
  signerAccount: any,
  agreementId: string,
  depositWei: bigint,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Broadcasting join agreement transaction...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "join_agreement",
    args: [agreementId],
    value: depositWei,
  });

  onProgress("Waiting for validator consensus...");
  await waitForTxReceipt(writeClient, txHash);
}

export async function initiateDissolution(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Broadcasting dissolution transaction...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "initiate_dissolution",
    args: [agreementId],
    value: 0n,
  });

  onProgress("Waiting for validator consensus...");
  await waitForTxReceipt(writeClient, txHash);
}

export async function submitEvidence(
  signerAccount: any,
  agreementId: string,
  evidence: string,
  category: string,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Broadcasting evidence submission...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "submit_evidence",
    args: [agreementId, evidence, category],
    value: 0n,
  });

  onProgress("Waiting for validator consensus...");
  await waitForTxReceipt(writeClient, txHash);
}

export async function proposeSplit(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Initiating AI Arbitration consensus (Deliberating 3 AI Judges)...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "propose_split",
    args: [agreementId],
    value: 0n,
  });

  onProgress("Deliberating splits & resolving URL evidence...");
  await waitForTxReceipt(writeClient, txHash);
}

export async function acceptProposal(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Signing split proposal...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "accept_proposal",
    args: [agreementId],
    value: 0n,
  });

  onProgress("Waiting for validator consensus...");
  await waitForTxReceipt(writeClient, txHash);
}

export async function disputeProposal(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Filing split dispute...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "dispute_proposal",
    args: [agreementId],
    value: 0n,
  });

  onProgress("Waiting for validator consensus...");
  await waitForTxReceipt(writeClient, txHash);
}

// ==========================================
// VowChainTreasury Reads & Writes
// ==========================================

export async function getWithdrawableBalance(address: string): Promise<bigint> {
  if (TREASURY_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") return 0n;
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
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Initiating pull withdrawal transfer...");
  const txHash = await writeClient.writeContract({
    address: TREASURY_CONTRACT_ADDRESS,
    functionName: "withdraw",
    args: [],
    value: 0n,
  });

  onProgress("Finalizing value transfer on GenLayer...");
  await waitForTxReceipt(writeClient, txHash);
  
  // Return withdrawn amount
  return 0n;
}

// ==========================================
// Reputation Reads
// ==========================================

export async function getPartnerReputation(address: string): Promise<number> {
  if (CORE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") return 0;
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

export async function settleDeadlock(
  signerAccount: any,
  agreementId: string,
  onProgress: (msg: string) => void
) {
  const writeClient = getWriteClient(signerAccount);
  
  onProgress("Signing deadlock resolution...");
  const txHash = await writeClient.writeContract({
    address: CORE_CONTRACT_ADDRESS,
    functionName: "settle_deadlock",
    args: [agreementId],
    value: 0n,
  });

  onProgress("Waiting for validator consensus...");
  await waitForTxReceipt(writeClient, txHash);
}
