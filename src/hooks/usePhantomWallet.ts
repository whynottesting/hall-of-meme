import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Types
type PhantomWallet = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  on: (event: string, callback: () => void) => void;
  disconnect: () => Promise<void>;
};

// Constants
const PHANTOM_MOBILE_LINK = "https://phantom.app/ul/browse/https://hall-of-meme.com";
const PHANTOM_DOWNLOAD_LINK = "https://phantom.app/";
const MOBILE_CHECK_INTERVAL = 1000; // 1 seconde

export const usePhantomWallet = () => {
  const [connected, setConnected] = useState(false);
  const [phantomWallet, setPhantomWallet] = useState<PhantomWallet | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Récupère l'instance de Phantom
  const getPhantomInstance = useCallback((): PhantomWallet | null => {
    try {
      // @ts-ignore
      const phantom = window.phantom?.solana;
      if (phantom?.isPhantom) {
        console.log("✅ Phantom instance trouvée");
        return phantom;
      }
      console.log("❌ Pas d'instance Phantom trouvée");
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'instance Phantom:", error);
      return null;
    }
  }, []);

  // Tente de connecter le wallet
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

  // Vérifie périodiquement la connexion sur mobile
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMobile && !connected && !checkingConnection) {
      setCheckingConnection(true);
      intervalId = setInterval(async () => {
        const wallet = getPhantomInstance();
        if (wallet?.publicKey) {
          console.log("🔍 Wallet trouvé après retour de l'app mobile");
          setPublicKey(wallet.publicKey.toString());
          setConnected(true);
          clearInterval(intervalId);
          setCheckingConnection(false);
        }
      }, MOBILE_CHECK_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMobile, connected, checkingConnection, getPhantomInstance]);

  // Gestionnaire de changement de visibilité
  const handleVisibilityChange = useCallback(async () => {
    if (!document.hidden) {
      console.log("👀 Application visible, vérification de la connexion...");
      const wallet = getPhantomInstance();
      
      if (wallet?.publicKey) {
        setPublicKey(wallet.publicKey.toString());
        setConnected(true);
      }
    }
  }, [getPhantomInstance]);

  // Initialisation
  useEffect(() => {
    const initializeWallet = async () => {
      const wallet = getPhantomInstance();
      if (wallet) {
        setPhantomWallet(wallet);
        
        // Écoute les événements de connexion/déconnexion
        wallet.on('connect', () => {
          console.log("🔌 Événement connect détecté");
          setConnected(true);
          if (wallet.publicKey) {
            setPublicKey(wallet.publicKey.toString());
          }
        });
        
        wallet.on('disconnect', () => {
          console.log("🔌 Événement disconnect détecté");
          setConnected(false);
          setPublicKey(null);
        });
        
        // Vérifie si déjà connecté
        if (wallet.publicKey) {
          console.log("🔄 Wallet déjà connecté");
          setPublicKey(wallet.publicKey.toString());
          setConnected(true);
        }
      }
    };

    initializeWallet();
    
    // Gestion de la visibilité pour le retour depuis l'app mobile
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [getPhantomInstance, handleVisibilityChange]);

  // Gestionnaire de connexion
  const handleConnectWallet = useCallback(async () => {
    console.log("🔄 Démarrage du processus de connexion...");
    
    if (isMobile && !phantomWallet) {
      console.log("📱 Redirection vers Phantom mobile");
      window.location.href = PHANTOM_MOBILE_LINK;
      return;
    }

    if (!phantomWallet) {
      console.log("⚠️ Phantom non détecté, redirection vers la page de téléchargement");
      toast({
        title: "Phantom Wallet Non Trouvé",
        description: "Veuillez installer Phantom Wallet pour continuer",
        variant: "destructive",
      });
      window.open(PHANTOM_DOWNLOAD_LINK, '_blank');
      return;
    }

    await attemptConnection(phantomWallet);
  }, [isMobile, phantomWallet, attemptConnection]);

  return { connected, phantomWallet, handleConnectWallet, publicKey };
};