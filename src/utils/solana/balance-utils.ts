import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaRPCConnection } from './rpc-config';

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

export const checkBalance = async (walletAddress: string): Promise<number> => {
  const rpcConnection = SolanaRPCConnection.getInstance();
  const pubKey = new PublicKey(walletAddress);
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔍 Vérification du solde (tentative ${attempt}/${MAX_RETRIES})`);
      const connection = rpcConnection.getConnection();
      const balance = await connection.getBalance(pubKey, 'confirmed');
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      console.log("💰 Solde trouvé:", balanceInSol, "SOL");
      return balanceInSol;
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative ${attempt}/${MAX_RETRIES}:`, error);
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Impossible de vérifier le solde après ${MAX_RETRIES} tentatives`);
      }
      
      await rpcConnection.switchToNextEndpoint();
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error("Échec de la vérification du solde");
};