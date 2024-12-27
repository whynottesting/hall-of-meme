import { useCallback } from 'react';
import { PhantomWallet } from '@/types/phantom';

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomWallet;
    };
  }
}

export const usePhantomInstance = () => {
  return useCallback((): PhantomWallet | null => {
    if (typeof window === 'undefined') return null;
    
    const provider = window.phantom?.solana;
    
    if (provider?.isPhantom) {
      return provider;
    }
    
    return null;
  }, []);
};