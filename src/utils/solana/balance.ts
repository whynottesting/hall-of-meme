import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { RPC_CONFIG } from './config';
import { toast } from "@/hooks/use-toast";

export const checkBalance = async (walletAddress: string): Promise<number> => {
  const solanaConnection = SolanaConnection.getInstance();
  const pubKey = new PublicKey(walletAddress);
  
  for (let attempt = 1; attempt <= RPC_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const connection = solanaConnection.getConnection();
      const balance = await connection.getBalance(pubKey, 'confirmed');
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      return balanceInSol;
    } catch (error: any) {
      if (attempt === RPC_CONFIG.MAX_RETRIES) {
        toast({
          title: "Erreur de connexion",
          description: "Impossible de vérifier le solde. Réessayez plus tard.",
          variant: "destructive",
        });
        throw new Error(`Unable to check balance after ${RPC_CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      await solanaConnection.switchToNextEndpoint();
      await new Promise(resolve => setTimeout(resolve, RPC_CONFIG.INITIAL_BACKOFF * attempt));
    }
  }
  
  throw new Error("Failed to check balance");
};