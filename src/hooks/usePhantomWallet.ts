import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PhantomWallet, PHANTOM_CONSTANTS } from '@/types/phantom';
import { usePhantomInstance } from './usePhantomInstance';
import { checkBalance } from '@/utils/solana';

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [phantomWallet, setPhantomWallet] = useState<PhantomWallet | null>(null);
  const isMobile = useIsMobile();
  const getPhantomInstance = usePhantomInstance();

  const updateWalletState = useCallback(async (wallet: PhantomWallet | null) => {
    if (!wallet?.publicKey) {
      setConnected(false);
      setPublicKey(null);
      setBalance(null);
      setPhantomWallet(null);
      return;
    }

    const key = wallet.publicKey.toString();
    const balanceInSol = await checkBalance(key);
    
    setPublicKey(key);
    setBalance(balanceInSol);
    setConnected(true);
    setPhantomWallet(wallet);
  }, []);

  useEffect(() => {
    const provider = getPhantomInstance();
    if (!provider) return;

    provider.on('connect', () => {
      updateWalletState(provider);
    });

    provider.on('disconnect', () => {
      updateWalletState(null);
      toast({
        title: "Wallet Déconnecté",
        description: "Déconnexion du Phantom wallet",
      });
    });

    provider.on('accountChanged', () => {
      updateWalletState(provider);
    });

    // Initial check
    updateWalletState(provider);

    return () => {
      provider.off('connect', () => {});
      provider.off('disconnect', () => {});
      provider.off('accountChanged', () => {});
    };
  }, [getPhantomInstance, updateWalletState]);

  const handleConnectWallet = useCallback(async () => {
    try {
      const provider = getPhantomInstance();
      
      if (!provider) {
        if (isMobile) {
          window.location.href = `${PHANTOM_CONSTANTS.MOBILE_LINK}${window.location.href}`;
          return;
        }
        
        window.open(PHANTOM_CONSTANTS.DOWNLOAD_LINK, '_blank');
        toast({
          title: "Phantom Wallet Non Trouvé",
          description: "Veuillez installer Phantom Wallet pour continuer",
          variant: "destructive",
        });
        return;
      }

      await provider.connect();
      await updateWalletState(provider);
      
      toast({
        title: "Wallet Connecté",
        description: `Connecté à l'adresse: ${provider.publicKey?.toString().slice(0, 8)}...`,
      });
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Échec de la Connexion",
        description: error.message || "Impossible de se connecter au wallet",
        variant: "destructive",
      });
    }
  }, [getPhantomInstance, isMobile, updateWalletState]);

  return { connected, handleConnectWallet, publicKey, balance, phantomWallet };
};