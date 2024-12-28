import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { checkBalance } from "@/utils/solana/balance";

interface PhantomWindow extends Window {
  solana?: {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: () => void) => void;
    removeListener: (event: string, callback: () => void) => void;
    isPhantom?: boolean;
    publicKey?: { toString: () => string };
  };
}

declare const window: PhantomWindow;

export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.solana?.publicKey) {
        const address = window.solana.publicKey.toString();
        setWalletAddress(address);
        
        // Log wallet address
        console.log("🦊 Wallet connecté:", address);
        
        // Get and log wallet balance
        try {
          const balance = await checkBalance(address);
          console.log("💰 Solde du wallet:", balance, "SOL");
        } catch (error) {
          console.error("❌ Erreur lors de la récupération du solde:", error);
        }
      }
    } catch (error) {
      console.error("Error checking if wallet is connected:", error);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);

      if (!window.solana) {
        window.open('https://phantom.app/download', '_blank');
        toast({
          title: "Phantom Wallet not found",
          description: "Please install Phantom Wallet to continue",
        });
        return;
      }

      if (!window.solana.isPhantom) {
        toast({
          title: "Phantom Wallet not found",
          description: "Please install Phantom Wallet to continue",
        });
        return;
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      
      // Log wallet address and balance after successful connection
      console.log("🦊 Wallet connecté:", address);
      try {
        const balance = await checkBalance(address);
        console.log("💰 Solde du wallet:", balance, "SOL");
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du solde:", error);
      }
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Phantom Wallet",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Error",
        description: "Connection rejected. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setWalletAddress(null);
        console.log("🔌 Wallet déconnecté");
        toast({
          title: "Wallet Disconnected",
          description: "Successfully disconnected from Phantom Wallet",
        });
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (window.solana) {
      window.solana.on('connect', () => {
        checkIfWalletIsConnected();
      });
      window.solana.on('disconnect', () => {
        setWalletAddress(null);
      });

      return () => {
        window.solana.removeListener('connect', () => {
          checkIfWalletIsConnected();
        });
        window.solana.removeListener('disconnect', () => {
          setWalletAddress(null);
        });
      };
    }
  }, []);

  return {
    walletAddress,
    isConnecting,
    connectWallet,
    disconnectWallet
  };
};