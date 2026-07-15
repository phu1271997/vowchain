# Prompt for Antigravity — VowChain finish (bind contracts + public deploy)

Copy everything below the line into Antigravity.

---

## Task

Ship the fixed VowChain frontend so GenLayer judges can **Create Agreement without the MetaMask Snaps error**, against the newly deployed contracts.

Local repo (frontend already fixed for `wallet_getSnaps`):

`/Users/peter/Downloads/AI/Genlayer/vowchain`

GitHub: https://github.com/phu1271997/vowchain  
Live target: https://vowchain.vercel.app  

### Judge bugs being fixed

1. `method [wallet_getSnaps] doesn't has corresponding handler` on create agreement  
2. Frontend errors / needs more testing  

### Root cause (already fixed in local code)

Old live build called `client.connect("studionet")` before writes → genlayer-js calls MetaMask Snaps (`wallet_getSnaps`). Regular MetaMask rejects that.  

**Fixed code never calls `connect()`**; Demo Sandbox uses local private-key signing; Snap RPC is polyfilled as a safety net.

## Deployed contracts (authoritative — already deployed)

| Contract | Address |
|---|---|
| **VowChain Core** | `0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B` |
| **VowChain Treasury** | `0x11fDd351Ad079A18278D8B05f98c555D51a187c5` |
| Network | GenLayer Studionet |
| RPC | `https://studio.genlayer.com/api` |
| Core source | `contracts/vowchain_core.py` |
| Treasury source | `contracts/vowchain_treasury.py` |

Explorer:

- https://explorer-studio.genlayer.com/address/0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B  
- https://explorer-studio.genlayer.com/address/0x11fDd351Ad079A18278D8B05f98c555D51a187c5  

### Env vars (must bake into Vite build)

```text
VITE_VOWCHAIN_CORE_ADDRESS=0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B
VITE_VOWCHAIN_TREASURY_ADDRESS=0x11fDd351Ad079A18278D8B05f98c555D51a187c5
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
```

## Steps (do in order)

### 1. Confirm local wiring

Working dir: `/Users/peter/Downloads/AI/Genlayer/vowchain`

Ensure `.env` and `.env.example` contain the three env vars above.

Optional schema check:

```bash
curl -s -X POST "https://studio.genlayer.com/api" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"gen_getContractSchema","params":["0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B"],"id":1}'
```

Expect methods including `create_agreement`, `join_agreement`, `get_agreement_counter` (or similar reads).

**Dependency link (if not done in Studio):**  
On Treasury: `set_core_address(0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B)`  
On Core: `set_dependencies(treasury, arbitrator)` if arbitrator was also deployed (see `DEPLOY.md`).  
If arbitrator is missing and create still works for simple path, note it; do not block frontend ship.

### 2. Build proof

```bash
cd /Users/peter/Downloads/AI/Genlayer/vowchain
npm install
npm run build

# MUST NOT reintroduce Snap-forcing connect before writes
grep -R "connect(\`studionet\`)" dist && echo "FAIL still has connect studionet" || echo "OK no connect(studionet)"

# MUST embed core address + create_agreement
grep -R "0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B" dist && echo "OK core address"
grep -R "create_agreement" dist >/dev/null && echo "OK methods"
grep -R "wallet_getSnaps" dist >/dev/null && echo "NOTE: snaps string may appear in polyfill only"
```

Fix any TypeScript/build errors before continuing.

### 3. Commit + push public GitHub

```bash
cd /Users/peter/Downloads/AI/Genlayer/vowchain
git status
git add -A
# keep node_modules / dist ignored

git commit -m "$(cat <<'EOF'
fix: remove MetaMask Snaps path; bind core + treasury addresses

Stop client.connect(studionet) which triggered wallet_getSnaps failures.
Default Demo Sandbox local signing; wire Studionet core/treasury deploys.
EOF
)"

git push origin main
```

Repo must stay **public**. Do not force-push unless necessary and confirmed.

### 4. Vercel public production deploy

Project for **https://vowchain.vercel.app** (repo `phu1271997/vowchain`).

| Setting | Value |
|---|---|
| Root Directory | repo root (Vite at root) |
| Framework | Vite |
| Build | `npm run build` |
| Output | `dist` |
| Deployment Protection | **OFF** |

Env **Production + Preview** (replace old/empty):

```text
VITE_VOWCHAIN_CORE_ADDRESS=0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B
VITE_VOWCHAIN_TREASURY_ADDRESS=0x11fDd351Ad079A18278D8B05f98c555D51a187c5
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
```

Trigger a **new production deploy after env change** (Vite bakes env at build time).

```bash
cd /Users/peter/Downloads/AI/Genlayer/vowchain
vercel link --yes --project vowchain   # if needed
vercel --prod --yes
```

### 5. Hard verification (must pass)

```bash
LIVE=https://vowchain.vercel.app
curl -sI "$LIVE" | head -12
# HTTP 200, NOT 302 to vercel.com/sso-api

ASSET=$(curl -s "$LIVE" | grep -oE '/assets/[^"]+\.js' | head -1)
echo "Asset: $ASSET"
curl -s "$LIVE$ASSET" | grep -o "0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B" | head -1
curl -s "$LIVE$ASSET" | grep -o "create_agreement" | head -1
# Must NOT appear in create path:
curl -s "$LIVE$ASSET" | grep -o 'connect(`studionet`)' | head -1 || echo "OK no connect studionet"
```

Incognito / UI smoke:

1. Open live app without SSO.  
2. Navbar shows **Demo Sandbox** (or switch to it).  
3. `/create` shows core address `0x9112998…` and green health if RPC works.  
4. Create prenup: Partner B = any valid other `0x` address → pick terms template → deposit **0 GEN** → Initialize Agreement.  
5. **Must not** show `wallet_getSnaps` / “doesn't has corresponding handler”.  
6. Success path: agreement ID shown, or a clear non-Snaps error (e.g. insufficient funds / Studio faucet needed).  

Optional funded write: fund demo address via Studio faucet, retry with 0 or small deposit.

### 6. Return to the human

Paste back:

1. GitHub commit URL / **full** SHA (use `git rev-parse HEAD`, do not invent padding)  
2. Final public live URL  
3. `curl -sI` proof (no SSO)  
4. Confirmation live JS embeds `0x9112998Ac8697732A835F9bf7Dd15367Ad850F5B`  
5. Confirmation live JS has **no** `connect(\`studionet\`)`  
6. Create-agreement smoke result (success or exact error text)  
7. Any blockers  

## Out of scope

- Do not reintroduce `client.connect("studionet")` before writes.  
- Do not require MetaMask Flask / GenLayer Snap for Demo Sandbox.  
- Do not enable Vercel SSO on production.  
- Do not use localnet RPC on Vercel.  

## Success criteria

- [ ] Public GitHub has snaps fix + addresses  
- [ ] Vercel env points at new core + treasury  
- [ ] Production bundle embeds core address  
- [ ] Production bundle does not call `connect(\`studionet\`)`  
- [ ] Create Agreement works in Demo Sandbox without `wallet_getSnaps` error  

---

End of Antigravity prompt.
