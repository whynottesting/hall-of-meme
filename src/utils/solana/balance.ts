import { PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { RPC_CONFIG } from './config';
import { toast } from "@/hooks/use-toast";

export const checkBalance = async (walletAddress: string): Promise<number> => {
  const solanaConnection = SolanaConnection.getInstance();
  const pubKey = new PublicKey(walletAddress);
  
  for (let attempt = 1; attempt <= RPC_CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`🔍 Checking balance (attempt ${attempt}/${RPC_CONFIG.MAX_RETRIES})`);
      const connection = solanaConnection.getConnection();
      
      // Explicitly type the connection and use getBalance with proper types
      const balance = await (connection as Connection).getBalance(pubKey, 'confirmed');
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      console.log("💰 Balance found:", balanceInSol, "SOL");
      return balanceInSol;
    } catch (error: any) {
      console.error(`❌ Error on attempt ${attempt}/${RPC_CONFIG.MAX_RETRIES}:`, error);
      
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