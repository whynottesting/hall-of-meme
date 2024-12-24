import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<any>(null);
  const isMobile = useIsMobile();

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

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("App became visible, checking wallet status...");
        try {
          // @ts-ignore
          const phantom = window.phantom?.solana;
          if (phantom?.isPhantom) {
            console.log("Phantom detected after visibility change");
            await phantom.connect();
            setConnected(true);
            setPhantomWallet(phantom);
          } else {
            console.log("Phantom not detected after visibility change");
          }
        } catch (error) {
          console.error("Error in visibility change handler:", error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (!phantomWallet && isMobile) {
        console.log("Mobile detected, no Phantom - trying deep link");
        window.location.href = "https://phantom.app/ul/browse/";
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