import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { RPC_CONFIG } from './config';
import { toast } from "@/hooks/use-toast";

export const checkBalance = async (walletAddress: string): Promise<number> => {
  console.log("🔄 Vérification du solde avec l'endpoint:", SolanaConnection.getInstance().getCurrentEndpoint());
  const solanaConnection = SolanaConnection.getInstance();
  const pubKey = new PublicKey(walletAddress);
  
  for (let attempt = 1; attempt <= RPC_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const connection = solanaConnection.getConnection();
      console.log("📡 Utilisation de l'endpoint:", connection.rpcEndpoint);
      const balance = await connection.getBalance(pubKey, 'confirmed');
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      console.log("💰 Solde trouvé:", balanceInSol, "SOL");
      return balanceInSol;
    } catch (error: any) {
      console.error(`❌ Tentative ${attempt} échouée:`, error);
      
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