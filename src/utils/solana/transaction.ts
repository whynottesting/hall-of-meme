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

    // Convert string public key to Solana PublicKey object
    const fromPubkey = new PublicKey(wallet.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const { signature } = await wallet.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error: any) {
    console.error("Erreur transaction:", error);
    throw new Error(error.message || "Erreur lors de la transaction");
  }
};