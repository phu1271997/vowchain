# Frontend fix — wallet_getSnaps / Create Agreement

## Judge error

```text
method [wallet_getSnaps] doesn't has corresponding handler
```

## Root cause

Older live builds called `client.connect("studionet")` before every write.
`genlayer-js` connect path invokes MetaMask **Snaps** (`wallet_getSnaps` /
`wallet_requestSnaps` for `npm:genlayer-wallet-plugin`). Regular MetaMask
(non-Flask) does not implement those methods → create agreement fails.

## Fix (this tree)

1. **Never call `client.connect()`** for writes (`src/lib/contractApi.ts`).
2. **Demo Sandbox default**: local `privateKeyToAccount` signs via
   `signTransaction` + `sendRawTransaction` (no Snaps).
3. **Early Snap polyfill** (`src/lib/snapsBypass.ts` + `main.tsx`) stubs
   `wallet_getSnaps` / `wallet_requestSnaps` if anything still probes them.
4. MetaMask path uses injected provider + `eth_sendTransaction` only.
5. Create form: deposit in **GEN** (not raw wei), partner validation, health banner.

## Verify locally

```bash
npm install
npm run dev
# Keep "Demo Sandbox" in navbar
# /create → partner 0x… → terms → deposit 0 → Initialize
```

## Deploy note

Set `VITE_VOWCHAIN_CORE_ADDRESS` (and treasury if used) on Vercel, then redeploy.
Without a real core address, create will fail with a clear config error (not Snaps).
