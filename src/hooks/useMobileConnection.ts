import { useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { usePhantomInstance } from './usePhantomInstance';

export const useMobileConnection = (
  isMobile: boolean,
  connected: boolean,
  checkingConnection: boolean,
  setCheckingConnection: (checking: boolean) => void,
  setPublicKey: (key: string | null) => void,
  setConnected: (connected: boolean) => void
) => {
  const getPhantomInstance = usePhantomInstance();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 secondes maximum

    const checkMobileConnection = async () => {
      const wallet = getPhantomInstance();
      attempts++;

      if (wallet?.publicKey) {
        console.log("🔍 Wallet trouvé après retour de l'app mobile");
        const key = wallet.publicKey.toString();
        setPublicKey(key);
        setConnected(true);
        setCheckingConnection(false);
        clearInterval(intervalId);
        
        toast({
          title: "Wallet Connecté",
          description: "Connexion réussie à Phantom wallet",
        });
      } else if (attempts >= MAX_ATTEMPTS) {
        console.log("⚠️ Timeout de la vérification de connexion mobile");
        clearInterval(intervalId);
        setCheckingConnection(false);
      }
    };

    if (isMobile && !connected && checkingConnection) {
      console.log("🔄 Démarrage de la vérification de connexion mobile...");
      checkMobileConnection();
      intervalId = setInterval(checkMobileConnection, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMobile, connected, checkingConnection, getPhantomInstance, setCheckingConnection, setConnected, setPublicKey]);

  useEffect(() => {
    const checkVisibility = async () => {
      if (!document.hidden) {
        console.log("👀 Application visible, vérification de la connexion...");
        const wallet = getPhantomInstance();
        
        if (wallet?.publicKey) {
          const key = wallet.publicKey.toString();
          console.log("✅ Wallet trouvé au retour, clé:", key);
          setPublicKey(key);
          setConnected(true);
          toast({
            title: "Wallet Connecté",
            description: "Connexion réussie à Phantom wallet",
          });
        }
      }
    };

    // Vérifie la connexion au chargement initial et à chaque focus
    checkVisibility();

    document.addEventListener('visibilitychange', checkVisibility);
    window.addEventListener('focus', checkVisibility);
    window.addEventListener('pageshow', checkVisibility);
    window.addEventListener('load', checkVisibility);

    return () => {
      document.removeEventListener('visibilitychange', checkVisibility);
      window.removeEventListener('focus', checkVisibility);
      window.removeEventListener('pageshow', checkVisibility);
      window.removeEventListener('load', checkVisibility);
    };
  }, [getPhantomInstance, setConnected, setPublicKey]);
};