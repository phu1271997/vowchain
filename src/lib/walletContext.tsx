import React, { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateDemoAccount, resetDemoAccount } from "./wallet";
import { wrapProviderWithSnapsBypass } from "./snapsBypass";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";

export type WalletMode = "demo" | "metamask";

interface WalletContextType {
  account: string | null;            // Hex address
  rawAccount: any;                  // String address or PrivateKeyAccount object
  walletMode: WalletMode;
  balance: string;
  isConnecting: boolean;
  connectMetaMask: () => Promise<void>;
  switchToDemo: () => void;
  resetDemoWallet: () => void;
  refreshBalance: () => Promise<void>;
  requestDemoFaucet: () => Promise<boolean>;
  setDemoPrivateKey: (pk: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [rawAccount, setRawAccount] = useState<any>(null);
  const [walletMode, setWalletMode] = useState<WalletMode>("demo");
  const [balance, setBalance] = useState<string>("0 GEN");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Initialize Demo Mode by default
  useEffect(() => {
    const savedMode = localStorage.getItem("vowchain_wallet_mode") as WalletMode;
    if (savedMode === "metamask") {
      checkMetaMaskConnection();
    } else {
      initializeDemoMode();
    }
  }, []);

  const initializeDemoMode = () => {
    const demo = getOrCreateDemoAccount();
    if (demo) {
      setAccount(demo.account.address);
      setRawAccount(demo.account);
      setWalletMode("demo");
      localStorage.setItem("vowchain_wallet_mode", "demo");
      fetchBalance(demo.account.address);
    }
  };

  const checkMetaMaskConnection = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        // Wrap globally to ensure bypass
        (window as any).ethereum = wrapProviderWithSnapsBypass((window as any).ethereum);
        
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setRawAccount(accounts[0]);
          setWalletMode("metamask");
          localStorage.setItem("vowchain_wallet_mode", "metamask");
          fetchBalance(accounts[0]);
        } else {
          initializeDemoMode(); // Fallback to demo if not authorized
        }
      } catch (err) {
        console.error("MetaMask check failed:", err);
        initializeDemoMode();
      } finally {
        setIsConnecting(false);
      }
    } else {
      initializeDemoMode();
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const client = createClient({ chain: studionet });
      // On studionet, getBalance is supported by standard providers
      const rawBal = await client.getBalance({ address: address as `0x${string}` });
      const gen = Number(rawBal) / 1e18;
      setBalance(`${gen.toFixed(4)} GEN`);
    } catch (err) {
      // Fallback for local testing/offline
      setBalance("10.0000 GEN (Mocked)");
    }
  };

  const connectMetaMask = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        (window as any).ethereum = wrapProviderWithSnapsBypass((window as any).ethereum);
        
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setRawAccount(accounts[0]);
          setWalletMode("metamask");
          localStorage.setItem("vowchain_wallet_mode", "metamask");
          await fetchBalance(accounts[0]);
        }
      } catch (err: any) {
        console.error("MetaMask connection failed:", err);
        throw new Error(err.message || "Failed to connect MetaMask");
      } finally {
        setIsConnecting(false);
      }
    } else {
      throw new Error("MetaMask is not installed");
    }
  };

  const switchToDemo = () => {
    initializeDemoMode();
  };

  const resetDemoWallet = () => {
    const demo = resetDemoAccount();
    if (demo) {
      setAccount(demo.account.address);
      setRawAccount(demo.account);
      setWalletMode("demo");
      localStorage.setItem("vowchain_wallet_mode", "demo");
      fetchBalance(demo.account.address);
    }
  };

  const refreshBalance = async () => {
    if (account) {
      await fetchBalance(account);
    }
  };

  // Top up Demo Wallet using MetaMask if connected, otherwise simulate mock faucet
  const requestDemoFaucet = async (): Promise<boolean> => {
    if (walletMode !== "demo" || !account) return false;
    
    // If MetaMask is installed, try to trigger a transfer from MetaMask to Demo Account
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        const mmAccounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (mmAccounts.length > 0) {
          const txParams = {
            from: mmAccounts[0],
            to: account,
            value: "1000000000000000000", // 1 GEN in Wei
          };
          await (window as any).ethereum.request({
            method: "eth_sendTransaction",
            params: [txParams],
          });
          await fetchBalance(account);
          return true;
        }
      } catch (err) {
        console.error("MetaMask faucet transfer failed, falling back to mock:", err);
      } finally {
        setIsConnecting(false);
      }
    }
    
    // Fallback: mock balance increase for offline/sandboxed demo
    setBalance("100.0000 GEN (Mock Faucet)");
    return true;
  };

  const setDemoPrivateKey = (pk: string) => {
    try {
      const acc = privateKeyToAccount(pk as `0x${string}`);
      localStorage.setItem("vowchain_pk_v3", pk);
      setAccount(acc.address);
      setRawAccount(acc);
      setWalletMode("demo");
      localStorage.setItem("vowchain_wallet_mode", "demo");
      fetchBalance(acc.address);
    } catch (err) {
      console.error("Failed to set demo private key:", err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        rawAccount,
        walletMode,
        balance,
        isConnecting,
        connectMetaMask,
        switchToDemo,
        resetDemoWallet,
        refreshBalance,
        requestDemoFaucet,
        setDemoPrivateKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
