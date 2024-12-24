import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkPhantomWallet = async () => {
      try {
        // @ts-ignore
        const phantom = window.phantom?.solana;
        
        if (phantom?.isPhantom) {
          setPhantomWallet(phantom);
          console.log("Phantom wallet detected!");
        } else if (!isMobile) {
          toast({
            title: "Phantom Wallet Non Trouvé",
            description: "Veuillez installer Phantom Wallet pour continuer",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error detecting Phantom wallet:", error);
      }
    };

    checkPhantomWallet();
  }, [isMobile]);

  const handleConnectWallet = async () => {
    try {
      if (!phantomWallet && isMobile) {
        // Try to detect if Phantom is installed by checking if we can open its deep link
        const phantomDeepLink = "https://phantom.app/ul/browse/";
        let connectionAttempted = false;

        const timer = setTimeout(() => {
          // Only redirect if no connection was attempted
          if (!connectionAttempted) {
            window.location.href = "https://phantom.app/download";
          }
        }, 1000);

        window.location.href = phantomDeepLink;
        
        // Clear the timeout if the page is hidden (meaning the deep link worked)
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            clearTimeout(timer);
            connectionAttempted = true;
          }
        });

        return;
      } else if (!phantomWallet) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

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