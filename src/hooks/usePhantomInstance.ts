import { useCallback } from 'react';
import { PhantomWallet } from '@/types/phantom';

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomWallet;
    };
    solana?: PhantomWallet;
  }
}

export const usePhantomInstance = () => {
  return useCallback((): PhantomWallet | null => {
    if (typeof window === 'undefined') {
      console.log("❌ Window n'est pas défini (SSR)");
      return null;
    }

    // Vérifier d'abord si Phantom est installé via window.phantom
    if ('phantom' in window && window.phantom?.solana?.isPhantom) {
      console.log("✅ Instance Phantom trouvée via window.phantom.solana");
      return window.phantom.solana;
    }

    // Fallback pour le support mobile et legacy
    if (window.solana?.isPhantom) {
      console.log("✅ Instance Phantom trouvée via window.solana");
      return window.solana;
    }

    console.log("❌ Phantom n'est pas installé");
    return null;
  }, []);
};