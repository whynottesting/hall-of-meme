import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PhantomWallet, PHANTOM_CONSTANTS, PHANTOM_ERROR_CODES } from '@/types/phantom';
import { usePhantomInstance } from './usePhantomInstance';
import { checkBalance } from '@/utils/solana';

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<PhantomWallet | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const getPhantomInstance = usePhantomInstance();

  const resetWalletState = useCallback(() => {
    setConnected(false);
    setPhantomWallet(null);
    setPublicKey(null);
    setBalance(null);
    console.log("🔄 État du wallet réinitialisé");
  }, []);

  const checkWalletBalance = useCallback(async (walletAddress: string) => {
    try {
      const balanceInSol = await checkBalance(walletAddress);
      console.log("💰 Solde vérifié:", balanceInSol, "SOL");
      setBalance(balanceInSol);
      return balanceInSol;
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du solde:", error);
      toast({
        title: "Erreur de Solde",
        description: "Impossible de récupérer le solde du wallet. Réessayez plus tard.",
        variant: "destructive",
      });
      return null;
    }
  }, []);

  const updateConnectionState = useCallback(async (wallet: PhantomWallet) => {
    try {
      if (wallet?.publicKey) {
        const key = wallet.publicKey.toString();
        setPublicKey(key);
        setConnected(true);
        console.log("✅ Connecté avec la clé:", key);
        await checkWalletBalance(key);
      } else {
        console.log("❌ Pas de clé publique disponible");
        resetWalletState();
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'état:", error);
      resetWalletState();
    }
  }, [checkWalletBalance, resetWalletState]);

  useEffect(() => {
    const wallet = getPhantomInstance();
    
    if (!wallet) {
      console.log("❌ Aucune instance Phantom trouvée lors de l'initialisation");
      resetWalletState();
      return;
    }

    const handleAccountChanged = (publicKey: any) => {
      console.log("👤 Changement de compte détecté");
      if (publicKey) {
        updateConnectionState(wallet);
      } else {
        resetWalletState();
      }
    };

    const handleDisconnect = () => {
      console.log("🔌 Déconnexion détectée");
      resetWalletState();
      toast({
        title: "Wallet Déconnecté",
        description: "Déconnexion du Phantom wallet",
      });
    };

    wallet.on('accountChanged', handleAccountChanged);
    wallet.on('disconnect', handleDisconnect);

    // Vérifier l'état initial de la connexion
    if (wallet.publicKey) {
      console.log("🔍 Wallet déjà connecté, mise à jour de l'état...");
      updateConnectionState(wallet);
    } else {
      console.log("❌ Wallet non connecté initialement");
      resetWalletState();
    }
    
    return () => {
      wallet.off('accountChanged', handleAccountChanged);
      wallet.off('disconnect', handleDisconnect);
    };
  }, [getPhantomInstance, updateConnectionState, resetWalletState]);

  const attemptConnection = useCallback(async (wallet: PhantomWallet): Promise<boolean> => {
    try {
      console.log("🔄 Tentative de connexion au wallet...");
      
      if (!wallet) {
        console.error("❌ Pas d'instance wallet disponible");
        return false;
      }

      // Vérifier si déjà connecté
      if (wallet.publicKey) {
        console.log("✅ Wallet déjà connecté");
        await updateConnectionState(wallet);
        return true;
      }

      // Demander la connexion
      const response = await wallet.connect({ onlyIfTrusted: false });
      
      if (response?.publicKey) {
        console.log("🎯 Clé publique obtenue:", response.publicKey.toString());
        await updateConnectionState(wallet);
        
        toast({
          title: "Wallet Connecté",
          description: `Connecté à l'adresse: ${response.publicKey.toString().slice(0, 8)}...`,
        });
        return true;
      }

      console.log("❌ Pas de clé publique après tentative de connexion");
      resetWalletState();
      return false;
    } catch (error: any) {
      console.error("❌ Échec de la tentative de connexion:", error);
      resetWalletState();
      
      let errorMessage = "Impossible de se connecter à Phantom wallet";
      
      if (error.code === PHANTOM_ERROR_CODES.USER_REJECTED) {
        errorMessage = "Connexion refusée par l'utilisateur";
      } else if (error.code === PHANTOM_ERROR_CODES.UNAUTHORIZED) {
        errorMessage = "Autorisation refusée";
      }
      
      if (!isMobile) {
        toast({
          title: "Échec de la Connexion",
          description: error.message || errorMessage,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [isMobile, resetWalletState, updateConnectionState]);

  const handleConnectWallet = useCallback(async () => {
    console.log("🔄 Démarrage du processus de connexion...");
    
    if (isMobile && !phantomWallet) {
      console.log("📱 Redirection vers Phantom mobile");
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedRef = encodeURIComponent(currentUrl);
      const phantomDeepLink = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
      
      window.location.href = phantomDeepLink;
      return;
    }

    const wallet = getPhantomInstance();
    if (!wallet) {
      console.log("⚠️ Phantom non détecté");
      toast({
        title: "Phantom Wallet Non Trouvé",
        description: "Veuillez installer Phantom Wallet pour continuer",
        variant: "destructive",
      });
      window.open(PHANTOM_CONSTANTS.DOWNLOAD_LINK, '_blank');
      return;
    }

    setPhantomWallet(wallet);
    await attemptConnection(wallet);
  }, [isMobile, phantomWallet, attemptConnection, getPhantomInstance]);

  return { connected, phantomWallet, handleConnectWallet, publicKey, balance };
};