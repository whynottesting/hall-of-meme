import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { PhantomWindow } from '@/types/phantom';

declare const window: PhantomWindow;

const PHANTOM_DOWNLOAD_URL = 'https://phantom.app/download';

export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const getProvider = useCallback(() => {
    if ('solana' in window) {
      const provider = window.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return null;
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const provider = getProvider();
      
      if (!provider) {
        window.open(PHANTOM_DOWNLOAD_URL, '_blank');
        return;
      }

      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      
      toast({
        title: "Succès",
        description: "Portefeuille connecté avec succès!",
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Erreur",
        description: "Connection rejetée. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [getProvider]);

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
        setWalletAddress(null);
        toast({
          title: "Info",
          description: "Portefeuille déconnecté",
        });
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  }, [getProvider]);

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.on('disconnect', () => {
        setWalletAddress(null);
      });

      // Check if already connected
      if (provider.publicKey) {
        setWalletAddress(provider.publicKey.toString());
      }
    }
  }, [getProvider]);

  return {
    walletAddress,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
};