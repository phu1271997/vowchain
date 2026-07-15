/**
 * MetaMask Snaps polyfill for VowChain.
 *
 * genlayer-js's client.connect("studionet") calls wallet_getSnaps /
 * wallet_requestSnaps (GenLayer Snap: npm:genlayer-wallet-plugin). Regular
 * MetaMask (non-Flask) throws:
 *   method [wallet_getSnaps] doesn't has corresponding handler
 *
 * VowChain prefers local private-key signing (Demo Sandbox) and never needs
 * Snaps for writes. This polyfill still stubs Snap RPC so any leftover
 * connect()/detection code fails soft instead of breaking Create Agreement.
 */

const GENLAYER_SNAP_NPM = "npm:genlayer-wallet-plugin";
const GENLAYER_SNAP_LOCAL = "local:http://localhost:8081";

const MOCK_SNAP = {
  id: GENLAYER_SNAP_NPM,
  version: "0.0.0-vowchain-polyfill",
  enabled: true,
  blocked: false,
};

function mockSnapsResult(params?: any) {
  // wallet_requestSnaps params look like { "npm:genlayer-wallet-plugin": {} }
  if (params && typeof params === "object" && !Array.isArray(params)) {
    const out: Record<string, typeof MOCK_SNAP> = {};
    for (const id of Object.keys(params)) {
      out[id] = { ...MOCK_SNAP, id };
    }
    if (Object.keys(out).length) return out;
  }
  return {
    [GENLAYER_SNAP_NPM]: { ...MOCK_SNAP, id: GENLAYER_SNAP_NPM },
    [GENLAYER_SNAP_LOCAL]: { ...MOCK_SNAP, id: GENLAYER_SNAP_LOCAL },
  };
}

function isSnapsMethod(method: string) {
  return (
    method === "wallet_getSnaps" ||
    method === "wallet_requestSnaps" ||
    method === "wallet_invokeSnap" ||
    method === "wallet_snap"
  );
}

function patchProvider(provider: any): any {
  if (!provider || typeof provider.request !== "function") return provider;
  if (provider.__vowchainSnapsPatched) return provider;

  const originalRequest = provider.request.bind(provider);

  const patchedRequest = async (args: { method: string; params?: any }) => {
    const method = args?.method;
    if (isSnapsMethod(method)) {
      if (method === "wallet_invokeSnap" || method === "wallet_snap") {
        // Writes must not depend on Snap execution.
        throw new Error(
          "GenLayer MetaMask Snap is not available in this browser. " +
            "Use VowChain Demo Sandbox mode (local key) — no Snap required."
        );
      }
      return mockSnapsResult(args?.params);
    }
    try {
      return await originalRequest(args);
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      // Some wallets reject unknown methods with this exact phrasing.
      if (
        msg.includes("wallet_getSnaps") ||
        msg.includes("wallet_requestSnaps") ||
        (msg.includes("doesn't has corresponding handler") &&
          String(args?.method || "").includes("Snap"))
      ) {
        return mockSnapsResult(args?.params);
      }
      throw err;
    }
  };

  try {
    provider.request = patchedRequest;
    provider.__vowchainSnapsPatched = true;
  } catch {
    // Provider may be frozen — wrap instead
    return new Proxy(provider, {
      get(target, prop, receiver) {
        if (prop === "request") return patchedRequest;
        if (prop === "__vowchainSnapsPatched") return true;
        return Reflect.get(target, prop, receiver);
      },
    });
  }
  return provider;
}

/** Patch window.ethereum (+ multi-provider list) as early as possible. */
export function installEthereumSnapsPolyfill(): void {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__vowchainSnapsPolyfillInstalled) {
    // Re-patch in case ethereum was replaced after install
    if (w.ethereum) patchProvider(w.ethereum);
    return;
  }
  w.__vowchainSnapsPolyfillInstalled = true;

  if (w.ethereum) {
    w.ethereum = patchProvider(w.ethereum);
    if (Array.isArray(w.ethereum?.providers)) {
      w.ethereum.providers = w.ethereum.providers.map(patchProvider);
    }
  }

  // If ethereum is injected later (async extension load), patch on access
  try {
    let current = w.ethereum;
    Object.defineProperty(w, "ethereum", {
      configurable: true,
      enumerable: true,
      get() {
        return current;
      },
      set(value) {
        current = value ? patchProvider(value) : value;
      },
    });
    if (current) current = patchProvider(current);
  } catch {
    // ignore if defineProperty fails
  }
}

/** Prefer a patched injected provider for MetaMask writes. */
export function getEthereumProvider(): any | null {
  installEthereumSnapsPolyfill();
  if (typeof window === "undefined") return null;
  const eth = (window as any).ethereum;
  if (!eth) return null;
  return patchProvider(eth);
}

/** @deprecated use installEthereumSnapsPolyfill + getEthereumProvider */
export function wrapProviderWithSnapsBypass(provider: any) {
  return patchProvider(provider);
}

export function isSnapsRelatedError(err: unknown): boolean {
  const msg = String((err as any)?.message || err || "").toLowerCase();
  return (
    msg.includes("wallet_getsnaps") ||
    msg.includes("wallet_requestsnaps") ||
    msg.includes("wallet_invokesnap") ||
    msg.includes("doesn't has corresponding handler") ||
    msg.includes("does not have a corresponding handler") ||
    msg.includes("genlayer snap") ||
    msg.includes("metamask snap")
  );
}

export function snapsFriendlyError(err: unknown): Error {
  if (!isSnapsRelatedError(err)) {
    return err instanceof Error ? err : new Error(String(err));
  }
  return new Error(
    "Wallet rejected a MetaMask Snaps call (wallet_getSnaps). " +
      "VowChain does not need Snaps — switch to Demo Sandbox in the navbar " +
      "(local key signs GenLayer txs) and try Create Agreement again."
  );
}
