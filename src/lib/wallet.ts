import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const STORAGE_KEY = "vowchain_pk_v3";

export interface DemoAccount {
  account: any; // viem PrivateKeyAccount
  pk: string;
}

export function getOrCreateDemoAccount(): DemoAccount | null {
  if (typeof window === "undefined") return null;
  
  let pk = localStorage.getItem(STORAGE_KEY);
  if (!pk) {
    pk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, pk);
  }
  
  try {
    return {
      account: privateKeyToAccount(pk as `0x${string}`),
      pk,
    };
  } catch (err) {
    console.error("Failed to recover private key from storage, generating new one:", err);
    const newPk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, newPk);
    return {
      account: privateKeyToAccount(newPk as `0x${string}`),
      pk: newPk,
    };
  }
}

export function resetDemoAccount(): DemoAccount | null {
  if (typeof window === "undefined") return null;
  
  const newPk = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, newPk);
  return {
    account: privateKeyToAccount(newPk as `0x${string}`),
    pk: newPk,
  };
}
