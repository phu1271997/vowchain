import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import {
  getEthereumProvider,
  installEthereumSnapsPolyfill,
  snapsFriendlyError,
} from "./snapsBypass";

const RPC_URL = String(
  import.meta.env.VITE_GENLAYER_RPC ?? "https://studio.genlayer.com/api"
).trim();

// Install Snap polyfill before any wallet interaction (safe no-op without ethereum).
if (typeof window !== "undefined") {
  installEthereumSnapsPolyfill();
}

// Read client is global and doesn't require a signer/account
export const readClient = createClient({
  chain: studionet,
  endpoint: RPC_URL,
});

export const config = {
  rpcUrl: RPC_URL,
  networkLabel: "GenLayer Studionet",
  chainId: studionet.id,
};

/**
 * Returns a genlayer client configured for writing transactions.
 *
 * IMPORTANT: Do NOT call client.connect("studionet") — that path requires the
 * GenLayer MetaMask Snap (wallet_getSnaps) which regular MetaMask rejects.
 *
 * - Demo mode: viem PrivateKeyAccount (type local) → signTransaction + sendRaw
 * - MetaMask: address string + injected provider → eth_sendTransaction
 */
export function getWriteClient(account: any) {
  installEthereumSnapsPolyfill();

  // Local private-key account (Demo Sandbox) — preferred path for judges
  if (
    account &&
    typeof account === "object" &&
    typeof account.signTransaction === "function" &&
    account.address
  ) {
    return createClient({
      chain: studionet,
      endpoint: RPC_URL,
      account,
    });
  }

  // Injected wallet (MetaMask etc.) — string address
  if (typeof account === "string" && account.startsWith("0x")) {
    const provider = getEthereumProvider();
    if (!provider) {
      throw new Error(
        "No browser wallet found. Click “Use Demo Mode” in the navbar to create agreements with a local sandbox key (no MetaMask Snaps)."
      );
    }
    return createClient({
      chain: studionet,
      endpoint: RPC_URL,
      account: account as `0x${string}`,
      provider,
    });
  }

  throw new Error(
    "Wallet not ready. Use Demo Sandbox mode or connect MetaMask, then try again."
  );
}

export function rethrowWalletError(err: unknown): never {
  throw snapsFriendlyError(err);
}
