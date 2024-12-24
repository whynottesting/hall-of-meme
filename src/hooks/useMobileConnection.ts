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

    const checkMobileConnection = async () => {
      const wallet = getPhantomInstance();
      if (wallet?.publicKey) {
        console.log("🔍 Wallet trouvé après retour de l'app mobile");
        setPublicKey(wallet.publicKey.toString());
        setConnected(true);
        setCheckingConnection(false);
        clearInterval(intervalId);
      }
    };

    if (isMobile && !connected && !checkingConnection) {
      console.log("🔄 Démarrage de la vérification de connexion mobile...");
      setCheckingConnection(true);
      checkMobileConnection();
      intervalId = setInterval(checkMobileConnection, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMobile, connected, checkingConnection, getPhantomInstance, setCheckingConnection, setConnected, setPublicKey]);

  const handleVisibilityChange = useEffect(() => {
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

    document.addEventListener('visibilitychange', checkVisibility);
    window.addEventListener('focus', checkVisibility);

    return () => {
      document.removeEventListener('visibilitychange', checkVisibility);
      window.removeEventListener('focus', checkVisibility);
    };
  }, [getPhantomInstance, setConnected, setPublicKey]);

  return handleVisibilityChange;
};