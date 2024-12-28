import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface PhantomWindow extends Window {
  solana?: {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: () => void) => void;
    publicKey: { toString: () => string } | null;
  };
}

declare const window: PhantomWindow;

export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const checkIfPhantomIsInstalled = () => {
    const provider = window.solana;
    if (!provider?.publicKey) {
      window.open('https://phantom.app/download', '_blank');
      return false;
    }
    return true;
  };

  const connectWallet = async () => {
    try {
      if (!checkIfPhantomIsInstalled()) return;

      const { publicKey } = await window.solana!.connect();
      const address = publicKey.toString();
      setWalletAddress(address);
      console.log('Connected wallet address:', address);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Error",
        description: "Connection rejected. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.solana?.disconnect();
      setWalletAddress(null);
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect wallet. Please try again.",
      });
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    const provider = window.solana;
    if (provider?.publicKey) {
      setWalletAddress(provider.publicKey.toString());
    }

    // Listen for wallet connection/disconnection events
    provider?.on('connect', () => {
      if (provider.publicKey) {
        setWalletAddress(provider.publicKey.toString());
      }
    });

    provider?.on('disconnect', () => {
      setWalletAddress(null);
    });
  }, []);

  return {
    walletAddress,
    connectWallet,
    disconnectWallet,
  };
};