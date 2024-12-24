import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<any>(null);
  const isMobile = useIsMobile();

  // Fonction pour obtenir l'instance de Phantom
  const getPhantomInstance = () => {
    try {
      // @ts-ignore
      return window.phantom?.solana;
    } catch (error) {
      console.error("Error getting Phantom instance:", error);
      return null;
    }
  };

  // Fonction pour tenter une connexion au wallet
  const attemptWalletConnection = async (phantom: any) => {
    try {
      console.log("Attempting wallet connection...");
      const response = await phantom.connect();
      if (response.publicKey) {
        console.log("Successfully connected with public key:", response.publicKey.toString());
        setConnected(true);
        setPhantomWallet(phantom);
        return true;
      }
    } catch (error) {
      console.error("Connection attempt failed:", error);
      return false;
    }
    return false;
  };

  // Gestionnaire de changement de visibilité
  const handleVisibilityChange = useCallback(async () => {
    if (!document.hidden) {
      console.log("App became visible, attempting reconnection...");
      const phantom = getPhantomInstance();
      
      if (phantom?.isPhantom) {
        console.log("Phantom detected after visibility change");
        try {
          const connected = await attemptWalletConnection(phantom);
          if (connected) {
            toast({
              title: "Wallet Connecté",
              description: "Connecté avec succès à Phantom wallet",
            });
          }
        } catch (error) {
          console.error("Error in visibility change handler:", error);
        }
      } else {
        console.log("Phantom not detected after visibility change");
      }
    }
  }, []);

  // Initialisation et gestion des événements
  useEffect(() => {
    const initializeWallet = async () => {
      const phantom = getPhantomInstance();
      
      if (phantom?.isPhantom) {
        console.log("Phantom wallet detected during initialization!");
        setPhantomWallet(phantom);
        await attemptWalletConnection(phantom);
      }
    };

    initializeWallet();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Fonction pour gérer la connexion du wallet
  const handleConnectWallet = async () => {
    try {
      if (!phantomWallet && isMobile) {
        console.log("Mobile detected, no Phantom - redirecting to deep link");
        window.location.href = "https://phantom.app/ul/browse/https://hall-of-meme.com";
        return;
      }

      if (!phantomWallet) {
        toast({
          title: "Phantom Wallet Non Trouvé",
          description: "Veuillez installer Phantom Wallet pour continuer",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const success = await attemptWalletConnection(phantomWallet);
      if (success) {
        toast({
          title: "Wallet Connecté",
          description: "Connecté avec succès à Phantom wallet",
        });
      }
    } catch (error) {
      console.error("Error in handleConnectWallet:", error);
      if (isMobile) {
        window.location.href = "https://phantom.app/download";
      }
      toast({
        title: "Échec de la Connexion",
        description: "Impossible de se connecter à Phantom wallet",
        variant: "destructive",
      });
    }
  };

  return { connected, phantomWallet, handleConnectWallet };
};