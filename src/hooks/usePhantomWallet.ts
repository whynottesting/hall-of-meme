import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PhantomWallet, PHANTOM_CONSTANTS } from '@/types/phantom';
import { usePhantomInstance } from './usePhantomInstance';

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<PhantomWallet | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const getPhantomInstance = usePhantomInstance();

  const resetWalletState = useCallback(() => {
    setConnected(false);
    setPublicKey(null);
    console.log("🔄 État du wallet réinitialisé");
  }, []);

  const updateConnectionState = useCallback((wallet: PhantomWallet) => {
    if (wallet.publicKey) {
      const key = wallet.publicKey.toString();
      setPublicKey(key);
      setConnected(true);
      console.log("✅ Connecté avec la clé:", key);
      console.log("💳 Adresse du wallet:", key);
    } else {
      resetWalletState();
    }
  }, [resetWalletState]);

  const attemptConnection = useCallback(async (wallet: PhantomWallet): Promise<boolean> => {
    try {
      console.log("🔄 Tentative de connexion au wallet...");
      
      try {
        await wallet.disconnect();
        console.log("🔌 Déconnexion réussie pour une connexion propre");
      } catch (e) {
        console.log("Info: Pas de déconnexion nécessaire");
      }
      
      console.log("🔄 Demande de connexion au wallet...");
      const response = await wallet.connect();
      
      if (response.publicKey) {
        console.log("🎯 Clé publique obtenue:", response.publicKey.toString());
        updateConnectionState(wallet);
        
        try {
          console.log("🔄 Demande des permissions de transaction...");
          await wallet.request({ 
            method: "connect",
            params: {
              permissions: ["sign_transaction", "sign_message"]
            }
          });
          console.log("✅ Permissions de transaction accordées");
          
          toast({
            title: "Wallet Connecté",
            description: `Connecté à l'adresse: ${response.publicKey.toString().slice(0, 8)}...`,
          });
          return true;
        } catch (permError) {
          console.error("❌ Erreur lors de la demande des permissions:", permError);
          resetWalletState();
          toast({
            title: "Attention",
            description: "Veuillez accorder les permissions de transaction",
            variant: "destructive",
          });
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Échec de la tentative de connexion:", error);
      resetWalletState();
      if (!isMobile) {
        toast({
          title: "Échec de la Connexion",
          description: "Impossible de se connecter à Phantom wallet",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [isMobile, resetWalletState, updateConnectionState]);

  useEffect(() => {
    const wallet = getPhantomInstance();
    if (wallet) {
      console.log("🔄 Initialisation du wallet...");
      setPhantomWallet(wallet);
      
      if (wallet.publicKey) {
        console.log("🔍 Wallet déjà connecté, mise à jour de l'état...");
        updateConnectionState(wallet);
      }
      
      wallet.on('connect', () => {
        console.log("🔌 Événement connect détecté");
        updateConnectionState(wallet);
      });
      
      wallet.on('disconnect', () => {
        console.log("🔌 Événement disconnect détecté");
        resetWalletState();
        toast({
          title: "Wallet Déconnecté",
          description: "Déconnexion du Phantom wallet",
        });
      });
    } else {
      console.log("❌ Aucune instance Phantom trouvée");
    }
  }, [getPhantomInstance, resetWalletState, updateConnectionState]);

  const handleConnectWallet = useCallback(async () => {
    console.log("🔄 Démarrage du processus de connexion...");
    
    if (isMobile && !phantomWallet) {
      console.log("📱 Redirection vers Phantom mobile");
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedRef = encodeURIComponent(currentUrl);
      const phantomDeepLink = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
      
      console.log("🔗 Deep link généré:", phantomDeepLink);
      window.location.href = phantomDeepLink;
      return;
    }

    if (!phantomWallet) {
      console.log("⚠️ Phantom non détecté");
      toast({
        title: "Phantom Wallet Non Trouvé",
        description: "Veuillez installer Phantom Wallet pour continuer",
        variant: "destructive",
      });
      window.open(PHANTOM_CONSTANTS.DOWNLOAD_LINK, '_blank');
      return;
    }

    await attemptConnection(phantomWallet);
  }, [isMobile, phantomWallet, attemptConnection]);

  return { connected, phantomWallet, handleConnectWallet, publicKey };
};