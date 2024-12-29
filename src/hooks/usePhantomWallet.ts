import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

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

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      const provider = getProvider();
      
      if (!provider) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await provider.connect();
      const key = response.publicKey.toString();
      setPublicKey(key);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${key.slice(0, 3)}...${key.slice(-3)}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
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
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
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
        setPublicKey(publicKey.toString());
      });

      provider.on('disconnect', () => {
        setPublicKey(null);
      });

      provider.on('accountChanged', (publicKey: { toString: () => string } | null) => {
        if (publicKey) {
          setPublicKey(publicKey.toString());
        } else {
          setPublicKey(null);
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