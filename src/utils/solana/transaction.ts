import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { PhantomWallet } from '@/types/phantom';
import { SOLANA_RPC_ENDPOINT } from './config';

export const createSolanaTransaction = async (
  wallet: PhantomWallet,
  recipientAddress: string,
  lamports: number
): Promise<string> => {
  try {
    const connection = new Connection(SOLANA_RPC_ENDPOINT);
    
    if (!wallet.publicKey) {
      throw new Error("Wallet non connecté");
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const { signature } = await wallet.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error: any) {
    console.error("Erreur transaction:", error);
    throw new Error(error.message || "Erreur lors de la transaction");
  }
};