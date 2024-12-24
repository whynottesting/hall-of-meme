import { useCallback } from 'react';
import { PhantomWallet } from '@/types/phantom';

export const usePhantomInstance = () => {
  return useCallback((): PhantomWallet | null => {
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
};