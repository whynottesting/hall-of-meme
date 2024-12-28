import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { checkBalance } from "@/utils/solana/balance";

type PhantomWindow = Window & {
  solana?: {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: () => void) => void;
    publicKey: { toString: () => string } | null;
    isPhantom?: boolean;
  };
};

export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<PhantomWindow['solana'] | null>(null);

  const getProvider = () => {
    if ('solana' in window) {
      const provider = (window as PhantomWindow).solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return null;
  };

  const connectWallet = useCallback(async () => {
    try {
      const provider = getProvider();
      
      if (!provider) {
        window.open('https://phantom.app/download', '_blank');
        return;
      }

      setProvider(provider);
      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      
      // Ajout des logs pour l'adresse et le solde
      console.log('🔑 Wallet Address:', address);
      try {
        const balance = await checkBalance(address);
        console.log('💰 Wallet Balance:', balance, 'SOL');
      } catch (error) {
        console.error('Error checking balance:', error);
      }
      
      toast({
        title: "Wallet Connected",
        description: "Your Phantom wallet has been successfully connected.",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Rejected",
        description: "Connection rejected. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
        setWalletAddress(null);
        setProvider(null);
        console.log('🔌 Wallet disconnected');
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      setProvider(provider);
      provider.on('disconnect', () => {
        setWalletAddress(null);
        setProvider(null);
        console.log('🔌 Wallet disconnected');
      });

      // Check if already connected and log the details
      if (provider.publicKey) {
        const address = provider.publicKey.toString();
        setWalletAddress(address);
        console.log('🔑 Wallet Address (initial):', address);
        checkBalance(address)
          .then(balance => console.log('💰 Wallet Balance (initial):', balance, 'SOL'))
          .catch(error => console.error('Error checking initial balance:', error));
      }
    }
  }, []);

  return {
    walletAddress,
    connectWallet,
    disconnectWallet,
    isConnected: !!walletAddress,
    provider
  };
};