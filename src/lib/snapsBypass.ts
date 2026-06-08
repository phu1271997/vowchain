/**
 * Intercepts MetaMask Snap calls to prevent errors in browser environments
 * where Snaps are not installed or supported.
 */
export function wrapProviderWithSnapsBypass(provider: any) {
  if (!provider || !provider.request) return provider;
  const originalRequest = provider.request.bind(provider);
  
  return {
    ...provider,
    request: async (args: { method: string; params?: any[] }) => {
      if (
        args.method === "wallet_getSnaps" ||
        args.method === "wallet_requestSnaps" ||
        args.method === "wallet_invokeSnap"
      ) {
        // Return empty mock responses to bypass snap checks gracefully
        return {};
      }
      return originalRequest(args);
    },
  };
}
