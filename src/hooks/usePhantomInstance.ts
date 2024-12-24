import { useCallback } from 'react';
import { PhantomWallet } from '@/types/phantom';

export const usePhantomInstance = () => {
  return useCallback((): PhantomWallet | null => {
    try {
      if (typeof window === 'undefined') return null;

      // @ts-ignore
      const provider = window?.phantom?.solana;
      
      if (provider?.isPhantom) {
        console.log("✅ Instance Phantom trouvée");
        return provider;
      }
      
      // Vérification spécifique pour mobile
      // @ts-ignore
      if (window?.solana?.isPhantom) {
        console.log("✅ Instance Phantom mobile trouvée via window.solana");
        // @ts-ignore
        return window.solana;
      }

      console.log("❌ Pas d'instance Phantom trouvée");
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'instance Phantom:", error);
      return null;
    }
  }, []);
};