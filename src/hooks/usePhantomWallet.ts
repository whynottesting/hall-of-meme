import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

// Define types for Solana window object
declare global {
  interface Window {
    solana?: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      publicKey: { toString: () => string };
      isPhantom?: boolean;
      on: (event: string, callback: () => void) => void;
      request: (args: { method: string; params?: any }) => Promise<any>;
    };
  }
}

export const usePhantomWallet = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Check if Phantom Wallet is installed
  const getProvider = () => {
    if ('solana' in window && window.solana?.isPhantom) {
      return window.solana;
    }
    return null;
  };

  // Get wallet balance
  const getBalance = async (walletPublicKey: string) => {
    try {
      const response = await window.solana?.request({
        method: 'getBalance',
        params: [walletPublicKey],
      });
      const balanceInSOL = response.value / 1000000000; // Convert lamports to SOL
      setBalance(balanceInSOL);
      console.log('Wallet Balance:', balanceInSOL, 'SOL');
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  // Connect wallet
  const connect = async () => {
    try {
      const provider = getProvider();
      if (!provider) {
        window.open('https://phantom.app/download', '_blank');
        return;
      }

      await provider.connect();
      const walletPublicKey = provider.publicKey.toString();
      setPublicKey(walletPublicKey);
      console.log('Connected wallet address:', walletPublicKey);
      
      // Get and log balance
      await getBalance(walletPublicKey);
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Phantom Wallet",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "Connection rejected. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
        setPublicKey(null);
        setBalance(null);
        toast({
          title: "Wallet Disconnected",
          description: "Successfully disconnected from Phantom Wallet",
        });
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      toast({
        title: "Disconnection Error",
        description: "Error disconnecting wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Listen for wallet connection changes
  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.on('connect', () => {
        setPublicKey(provider.publicKey.toString());
      });
      provider.on('disconnect', () => {
        setPublicKey(null);
        setBalance(null);
      });
    }
  }, []);

  return {
    publicKey,
    balance,
    connect,
    disconnect,
    isConnected: !!publicKey,
  };
};