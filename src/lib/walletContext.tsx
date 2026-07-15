import React, { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateDemoAccount, resetDemoAccount } from "./wallet";
import {
  getEthereumProvider,
  installEthereumSnapsPolyfill,
  snapsFriendlyError,
} from "./snapsBypass";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "./genlayerClient";

export type WalletMode = "demo" | "metamask";

interface WalletContextType {
  account: string | null;
  rawAccount: any;
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

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [rawAccount, setRawAccount] = useState<any>(null);
  const [walletMode, setWalletMode] = useState<WalletMode>("demo");
  const [balance, setBalance] = useState<string>("0 GEN");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    installEthereumSnapsPolyfill();
    // Always prefer Demo Sandbox by default — avoids wallet_getSnaps on first load.
    // Only restore MetaMask if user explicitly chose it AND ethereum is present.
    const savedMode = localStorage.getItem("vowchain_wallet_mode") as WalletMode;
    if (savedMode === "metamask" && (window as any).ethereum) {
      checkMetaMaskConnection().catch(() => initializeDemoMode());
    } else {
      initializeDemoMode();
    }
  }, []);

  const initializeDemoMode = () => {
    const demo = getOrCreateDemoAccount();
    if (demo) {
      setAccount(demo.account.address);
      setRawAccount(demo.account); // PrivateKeyAccount with signTransaction
      setWalletMode("demo");
      localStorage.setItem("vowchain_wallet_mode", "demo");
      fetchBalance(demo.account.address);
    }
  };

  const checkMetaMaskConnection = async () => {
    const eth = getEthereumProvider();
    if (!eth) {
      initializeDemoMode();
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await eth.request({ method: "eth_accounts" });
      if (accounts?.length > 0) {
        setAccount(accounts[0]);
        setRawAccount(accounts[0]);
        setWalletMode("metamask");
        localStorage.setItem("vowchain_wallet_mode", "metamask");
        fetchBalance(accounts[0]);
      } else {
        initializeDemoMode();
      }
    } catch (err) {
      console.error("MetaMask check failed:", err);
      initializeDemoMode();
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const client = createClient({
        chain: studionet,
        endpoint: config.rpcUrl,
      });
      const rawBal = await client.getBalance({
        address: address as `0x${string}`,
      });
      const gen = Number(rawBal) / 1e18;
      setBalance(`${gen.toFixed(4)} GEN`);
    } catch {
      // Demo accounts on Studionet often have 0 until funded — still usable UX
      setBalance("0.0000 GEN (fund via Studio faucet if needed)");
    }
  };

  const connectMetaMask = async () => {
    const eth = getEthereumProvider();
    if (!eth) {
      throw new Error(
        "MetaMask is not installed. Stay on Demo Sandbox mode to create agreements without Snaps."
      );
    }
    try {
      setIsConnecting(true);
      // Only request accounts — never client.connect() / wallet_getSnaps
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts?.length > 0) {
        // Best-effort chain add/switch without Snaps
        try {
          const chainIdHex = `0x${Number(studionet.id).toString(16)}`;
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
        } catch {
          try {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${Number(studionet.id).toString(16)}`,
                  chainName: studionet.name || "GenLayer Studionet",
                  nativeCurrency: {
                    name: "GEN",
                    symbol: "GEN",
                    decimals: 18,
                  },
                  rpcUrls: [config.rpcUrl],
                },
              ],
            });
          } catch {
            /* user rejected — still allow address connection */
          }
        }

        setAccount(accounts[0]);
        setRawAccount(accounts[0]);
        setWalletMode("metamask");
        localStorage.setItem("vowchain_wallet_mode", "metamask");
        await fetchBalance(accounts[0]);
      }
    } catch (err: any) {
      console.error("MetaMask connection failed:", err);
      throw snapsFriendlyError(err);
    } finally {
      setIsConnecting(false);
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
    if (account) await fetchBalance(account);
  };

  const requestDemoFaucet = async (): Promise<boolean> => {
    if (walletMode !== "demo" || !account) return false;

    const eth = getEthereumProvider();
    if (eth) {
      try {
        setIsConnecting(true);
        const mmAccounts = await eth.request({ method: "eth_accounts" });
        if (mmAccounts?.length > 0) {
          await eth.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: mmAccounts[0],
                to: account,
                value: "0xde0b6b3a7640000", // 1 GEN
              },
            ],
          });
          await fetchBalance(account);
          return true;
        }
      } catch (err) {
        console.error("MetaMask faucet transfer failed:", err);
      } finally {
        setIsConnecting(false);
      }
    }

    setBalance("Fund this address via GenLayer Studio faucet for live writes");
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
