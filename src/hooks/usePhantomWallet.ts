import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<any>(null);
  const isMobile = useIsMobile();

  // Fonction pour vérifier l'état de connexion
  const checkConnectionStatus = async (phantom: any) => {
    try {
      console.log("Checking connection status...");
      const response = await phantom.connect({ onlyIfTrusted: true });
      if (response.publicKey) {
        setConnected(true);
        console.log("Wallet connected with public key:", response.publicKey.toString());
        return true;
      }
    } catch (error) {
      console.log("Not already connected:", error);
    }
    return false;
  };

  useEffect(() => {
    const checkPhantomWallet = async () => {
      try {
        // @ts-ignore
        const phantom = window.phantom?.solana;
        
        if (phantom?.isPhantom) {
          setPhantomWallet(phantom);
          console.log("Phantom wallet detected!");
          await checkConnectionStatus(phantom);
        }
      } catch (error) {
        console.error("Error detecting Phantom wallet:", error);
      }
    };

    checkPhantomWallet();

    // Ajouter un listener pour détecter quand l'utilisateur revient sur l'application
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("App became visible, checking wallet status...");
        try {
          // @ts-ignore
          const phantom = window.phantom?.solana;
          if (phantom?.isPhantom) {
            console.log("Phantom detected after visibility change");
            const isConnected = await checkConnectionStatus(phantom);
            console.log("Connection status after visibility change:", isConnected);
          } else {
            console.log("Phantom not detected after visibility change");
          }
        } catch (error) {
          console.error("Error in visibility change handler:", error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (!phantomWallet && isMobile) {
        console.log("Mobile detected, no Phantom - trying deep link");
        const phantomDeepLink = "https://phantom.app/ul/browse/";
        let connectionAttempted = false;

        const timer = setTimeout(() => {
          if (!connectionAttempted) {
            console.log("No connection attempt detected, redirecting to download page");
            window.location.href = "https://phantom.app/download";
          }
        }, 2000);
        
        window.location.href = phantomDeepLink;
        
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            console.log("Page hidden, clearing timeout");
            clearTimeout(timer);
            connectionAttempted = true;
          }
        }, { once: true });

        return;
      } else if (!phantomWallet) {
        toast({
          title: "Phantom Wallet Non Trouvé",
          description: "Veuillez installer Phantom Wallet pour continuer",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }

      console.log("Attempting to connect to Phantom wallet...");
      const { publicKey } = await phantomWallet.connect();
      if (publicKey) {
        setConnected(true);
        console.log("Connected with public key:", publicKey.toString());
        toast({
          title: "Wallet Connecté",
          description: "Connecté avec succès à Phantom wallet",
        });
      }
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
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