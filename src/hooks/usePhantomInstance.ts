import { useCallback } from 'react';
import { PhantomWallet } from '@/types/phantom';

export const usePhantomInstance = () => {
  return useCallback((): PhantomWallet | null => {
    if (typeof window === 'undefined') return null;

    // Vérifier d'abord si Phantom est installé
    if ('phantom' in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        console.log("✅ Instance Phantom trouvée via window.phantom.solana");
        return provider;
      }
    }

    // Fallback pour le support mobile et legacy
    if (window?.solana?.isPhantom) {
      console.log("✅ Instance Phantom trouvée via window.solana");
      return window.solana;
    }

    console.log("❌ Phantom n'est pas installé");
    return null;
  }, []);
};