import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { checkBalance } from "@/utils/solana";

export type PhantomProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  isPhantom: boolean;
};

type WindowWithPhantom = Window & {
  phantom?: {
    solana?: PhantomProvider;
  };
};

const getProvider = (): PhantomProvider | null => {
  if (typeof window === 'undefined') return null;
  const windowWithPhantom = window as WindowWithPhantom;
  const provider = windowWithPhantom.phantom?.solana;
  return provider && provider.isPhantom ? provider : null;
};

export const usePhantomWallet = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkAndLogBalance = async (address: string) => {
    try {
      const balance = await checkBalance(address);
      console.log('💰 Wallet Balance:', balance, 'SOL');
    } catch (error) {
      console.error('❌ Error checking balance:', error);
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      const provider = getProvider();
      
      if (!provider) {
        console.log('🦊 Phantom wallet not found - redirecting to install page');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await provider.connect();
      const key = response.publicKey.toString();
      setPublicKey(key);
      console.log('🔑 Connected to wallet:', key);
      console.log('✅ Connection status: Connected');
      
      // Check balance after successful connection
      await checkAndLogBalance(key);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${key.slice(0, 3)}...${key.slice(-3)}`,
      });
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      console.log('❌ Connection status: Disconnected');
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
        setPublicKey(null);
        console.log('👋 Wallet disconnected');
        console.log('❌ Connection status: Disconnected');
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected.",
        });
      }
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      toast({
        variant: "destructive",
        title: "Disconnection Error",
        description: "Failed to disconnect wallet. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.on('connect', (publicKey: { toString: () => string }) => {
        const key = publicKey.toString();
        setPublicKey(key);
        console.log('🔄 Wallet connected event:', key);
        checkAndLogBalance(key);
      });

      provider.on('disconnect', () => {
        setPublicKey(null);
        console.log('🔄 Wallet disconnected event');
      });

      provider.on('accountChanged', (publicKey: { toString: () => string } | null) => {
        if (publicKey) {
          const key = publicKey.toString();
          setPublicKey(key);
          console.log('🔄 Account changed event - New wallet:', key);
          checkAndLogBalance(key);
        } else {
          setPublicKey(null);
          console.log('🔄 Account changed event - No wallet connected');
        }
      });
    }
  }, []);

  return {
    publicKey,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isPhantomInstalled: !!getProvider(),
  };
};