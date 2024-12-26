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

  const attemptConnection = useCallback(async (wallet: PhantomWallet): Promise<boolean> => {
    try {
      console.log("🔄 Tentative de connexion au wallet...");
      
      // Réinitialiser l'état avant la tentative de connexion
      resetWalletState();
      
      // Déconnecter d'abord pour s'assurer d'une connexion propre
      try {
        await wallet.disconnect();
        console.log("🔌 Déconnexion réussie pour une connexion propre");
      } catch (e) {
        console.log("Info: Pas de déconnexion nécessaire");
      }
      
      // Vérifier si le wallet a une clé publique
      if (!wallet.publicKey) {
        console.log("🔄 Demande de connexion au wallet...");
        const response = await wallet.connect();
        
        if (response.publicKey) {
          const key = response.publicKey.toString();
          console.log("✅ Connecté avec succès! Clé publique:", key);
          setPublicKey(key);
          setConnected(true);
          
          // Demander explicitement les permissions de transaction
          try {
            console.log("🔄 Demande des permissions de transaction...");
            await wallet.request({ 
              method: "connect",
              params: {
                permissions: ["sign_transaction", "sign_message"]
              }
            });
            console.log("✅ Permissions de transaction accordées");
            
            // Vérifier le solde pour confirmer l'accès
            try {
              const balance = await wallet.request({
                method: 'getBalance',
              });
              console.log("💰 Solde du wallet:", balance);
            } catch (balanceError) {
              console.warn("⚠️ Impossible de vérifier le solde:", balanceError);
            }
            
            toast({
              title: "Wallet Connecté",
              description: "Connexion réussie à Phantom wallet avec les permissions de transaction",
            });
            return true;
          } catch (permError) {
            console.error("❌ Erreur lors de la demande des permissions:", permError);
            resetWalletState();
            toast({
              title: "Attention",
              description: "Veuillez accorder les permissions de transaction pour pouvoir effectuer des achats",
              variant: "destructive",
            });
            return false;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Échec de la tentative de connexion:", error);
      resetWalletState();
      if (!isMobile) {
        toast({
          title: "Échec de la Connexion",
          description: "Impossible de se connecter à Phantom wallet. Assurez-vous que l'extension est installée, déverrouillée et en mode Devnet.",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [isMobile, resetWalletState]);

  useEffect(() => {
    const initializeWallet = async () => {
      const wallet = getPhantomInstance();
      if (wallet) {
        console.log("🔄 Initialisation du wallet...");
        setPhantomWallet(wallet);
        
        // Vérifier l'état de connexion réel
        if (wallet.publicKey) {
          console.log("🔄 Wallet déjà connecté, clé:", wallet.publicKey.toString());
          setPublicKey(wallet.publicKey.toString());
          setConnected(true);
          
          // Vérifier/demander les permissions pour la connexion existante
          try {
            await wallet.request({ 
              method: "connect",
              params: {
                permissions: ["sign_transaction", "sign_message"]
              }
            });
            console.log("✅ Permissions de transaction vérifiées/accordées");
          } catch (error) {
            console.warn("⚠️ Permissions de transaction non accordées:", error);
            // Forcer une nouvelle connexion pour obtenir les permissions
            await attemptConnection(wallet);
          }
        } else {
          console.log("❌ Wallet non connecté lors de l'initialisation");
          resetWalletState();
        }
        
        wallet.on('connect', () => {
          console.log("🔌 Événement connect détecté");
          if (wallet.publicKey) {
            const key = wallet.publicKey.toString();
            console.log("✅ Connecté avec la clé:", key);
            setPublicKey(key);
            setConnected(true);
          }
        });
        
        wallet.on('disconnect', () => {
          console.log("🔌 Événement disconnect détecté");
          resetWalletState();
          toast({
            title: "Wallet Déconnecté",
            description: "Déconnexion du Phantom wallet",
          });
        });
      }
    };

    initializeWallet();
  }, [getPhantomInstance, attemptConnection, resetWalletState]);

  const handleConnectWallet = useCallback(async () => {
    console.log("🔄 Démarrage du processus de connexion...");
    
    if (isMobile && !phantomWallet) {
      console.log("📱 Redirection vers Phantom mobile");
      const currentUrl = window.location.href;
      console.log("URL actuelle:", currentUrl);
      
      // Construction du deep link selon la documentation Phantom
      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedRef = encodeURIComponent(currentUrl);
      const phantomDeepLink = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
      
      console.log("🔗 Deep link généré:", phantomDeepLink);
      window.location.href = phantomDeepLink;
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