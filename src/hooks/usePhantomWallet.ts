import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<any>(null);

  useEffect(() => {
    const checkPhantomWallet = async () => {
      try {
        // @ts-ignore
        const phantom = window.phantom?.solana;
        
        if (phantom?.isPhantom) {
          setPhantomWallet(phantom);
          console.log("Phantom wallet detected!");
        } else {
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
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (!phantomWallet) {
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
      toast({
        title: "Échec de la Connexion",
        description: "Impossible de se connecter à Phantom wallet",
        variant: "destructive",
      });
    }
  };

  return { connected, phantomWallet, handleConnectWallet };
};