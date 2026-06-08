import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// Read client is global and doesn't require a signer/account
export const readClient = createClient({
  chain: studionet,
});

/**
 * Returns a genlayer client configured for writing transactions.
 * @param account Can be a string address (MetaMask) or a PrivateKeyAccount object (Demo Mode)
 */
export function getWriteClient(account: any) {
  if (typeof account === "string") {
    // MetaMask Mode
    return createClient({
      chain: studionet,
      account: account as `0x${string}`,
    });
  } else {
    // Demo Mode (using local PrivateKeyAccount)
    return createClient({
      chain: studionet,
      account: account,
    });
  }
}
