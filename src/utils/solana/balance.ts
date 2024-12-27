import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaConnection } from './connection';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const checkBalance = async (walletAddress: string): Promise<number> => {
  const solanaConnection = SolanaConnection.getInstance();
  const pubKey = new PublicKey(walletAddress);
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔍 Checking balance (attempt ${attempt}/${MAX_RETRIES})`);
      const connection = solanaConnection.getConnection();
      const balance = await connection.getBalance(pubKey, 'confirmed');
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      console.log("💰 Balance found:", balanceInSol, "SOL");
      return balanceInSol;
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt}/${MAX_RETRIES}:`, error);
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Unable to check balance after ${MAX_RETRIES} attempts`);
      }
      
      await solanaConnection.switchToNextEndpoint();
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  
  throw new Error("Failed to check balance");
};