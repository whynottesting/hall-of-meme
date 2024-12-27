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

  const checkWalletConnection = useCallback(async (wallet: PhantomWallet | null) => {
    if (!wallet) {
      console.log("❌ Pas de wallet trouvé");
      resetWalletState();
      return false;
    }

    try {
      if (!wallet.publicKey) {
        console.log("❌ Wallet non déverrouillé");
        resetWalletState();
        return false;
      }

      const key = wallet.publicKey.toString();
      console.log("✅ Clé publique trouvée:", key);
      
      const balanceInSol = await checkBalance(key);
      console.log("💰 Solde vérifié:", balanceInSol, "SOL");
      
      setPublicKey(key);
      setBalance(balanceInSol);
      setConnected(true);
      setPhantomWallet(wallet);
      
      return true;
    } catch (error) {
      console.log("❌ Erreur lors de la vérification du wallet:", error);
      resetWalletState();
      return false;
    }
  }, [resetWalletState]);

  useEffect(() => {
    const wallet = getPhantomInstance();
    
    const handleAccountChanged = async () => {
      console.log("👤 Changement de compte détecté");
      await checkWalletConnection(wallet);
    };

    const handleDisconnect = () => {
      console.log("🔌 Déconnexion détectée");
      resetWalletState();
      toast({
        title: "Wallet Déconnecté",
        description: "Déconnexion du Phantom wallet",
      });
    };

    if (wallet) {
      wallet.on('accountChanged', handleAccountChanged);
      wallet.on('disconnect', handleDisconnect);
      
      // Vérification initiale avec onlyIfTrusted pour ne pas afficher de popup
      wallet.connect({ onlyIfTrusted: true })
        .then(() => checkWalletConnection(wallet))
        .catch(() => {
          console.log("❌ Wallet non autorisé ou verrouillé");
          resetWalletState();
        });
    }
    
    return () => {
      if (wallet) {
        wallet.off('accountChanged', handleAccountChanged);
        wallet.off('disconnect', handleDisconnect);
      }
    };
  }, [getPhantomInstance, checkWalletConnection, resetWalletState]);

  const handleConnectWallet = useCallback(async () => {
    console.log("🔄 Démarrage du processus de connexion...");
    
    if (isMobile && !phantomWallet) {
      console.log("📱 Redirection vers Phantom mobile");
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedRef = encodeURIComponent(currentUrl);
      window.location.href = `${PHANTOM_CONSTANTS.MOBILE_LINK}${encodedUrl}?ref=${encodedRef}`;
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

    try {
      console.log("🔑 Demande de connexion au wallet...");
      // Demande explicite de connexion qui déclenchera le déverrouillage si nécessaire
      await wallet.connect();
      
      const isConnected = await checkWalletConnection(wallet);
      
      if (isConnected) {
        toast({
          title: "Wallet Connecté",
          description: `Connecté à l'adresse: ${wallet.publicKey?.toString().slice(0, 8)}...`,
        });
      } else {
        toast({
          title: "Échec de la Connexion",
          description: "Impossible de se connecter au wallet",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la connexion:", error);
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
    }
  }, [isMobile, phantomWallet, getPhantomInstance, checkWalletConnection, resetWalletState]);

  return { connected, phantomWallet, handleConnectWallet, publicKey, balance };
};