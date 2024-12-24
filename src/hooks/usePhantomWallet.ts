import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PhantomWallet, PHANTOM_CONSTANTS } from '@/types/phantom';
import { usePhantomInstance } from './usePhantomInstance';
import { useMobileConnection } from './useMobileConnection';

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<PhantomWallet | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [checkingConnection, setCheckingConnection] = useState(false);

  const getPhantomInstance = usePhantomInstance();

  const attemptConnection = useCallback(async (wallet: PhantomWallet): Promise<boolean> => {
    try {
      console.log("🔄 Tentative de connexion au wallet...");
      const response = await wallet.connect();
      
      if (response.publicKey) {
        const key = response.publicKey.toString();
        console.log("✅ Connecté avec succès! Clé publique:", key);
        setPublicKey(key);
        setConnected(true);
        toast({
          title: "Wallet Connecté",
          description: "Connexion réussie à Phantom wallet",
        });
        return true;
      }
    } catch (error) {
      console.error("❌ Échec de la tentative de connexion:", error);
      if (!isMobile) {
        toast({
          title: "Échec de la Connexion",
          description: "Impossible de se connecter à Phantom wallet",
          variant: "destructive",
        });
      }
    }
    return false;
  }, [isMobile]);

  useMobileConnection(
    isMobile,
    connected,
    checkingConnection,
    setCheckingConnection,
    setPublicKey,
    setConnected
  );

  useEffect(() => {
    const initializeWallet = async () => {
      const wallet = getPhantomInstance();
      if (wallet) {
        setPhantomWallet(wallet);
        
        wallet.on('connect', () => {
          console.log("🔌 Événement connect détecté");
          if (wallet.publicKey) {
            const key = wallet.publicKey.toString();
            console.log("✅ Connecté avec la clé:", key);
            setPublicKey(key);
            setConnected(true);
            toast({
              title: "Wallet Connecté",
              description: "Connexion réussie à Phantom wallet",
            });
          }
        });
        
        wallet.on('disconnect', () => {
          console.log("🔌 Événement disconnect détecté");
          setConnected(false);
          setPublicKey(null);
          toast({
            title: "Wallet Déconnecté",
            description: "Déconnexion du Phantom wallet",
          });
        });
        
        if (wallet.publicKey) {
          console.log("🔄 Wallet déjà connecté");
          setPublicKey(wallet.publicKey.toString());
          setConnected(true);
        }
      }
    };

    initializeWallet();
  }, [getPhantomInstance]);

  const handleConnectWallet = useCallback(async () => {
    console.log("🔄 Démarrage du processus de connexion...");
    
    if (isMobile && !phantomWallet) {
      console.log("📱 Redirection vers Phantom mobile");
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const deepLink = `https://phantom.app/ul/browse/${encodedUrl}`;
      console.log("🔗 Deep link généré:", deepLink);
      window.location.href = deepLink;
      return;
    }

    if (!phantomWallet) {
      console.log("⚠️ Phantom non détecté, redirection vers la page de téléchargement");
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