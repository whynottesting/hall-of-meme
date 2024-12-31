import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from './types';

export const createSolanaTransaction = async (
  provider: PhantomProvider,
  recipientAddress: string,
  lamports: number
): Promise<Transaction | null> => {
  const connection = SolanaConnection.getInstance().getConnection();
  
  try {
    if (!provider.publicKey) {
      throw new Error("Wallet non connecté");
    }
    
    const fromPubkey = provider.publicKey;
    const toPubkey = new PublicKey(recipientAddress);
    
    const balance = await connection.getBalance(fromPubkey);
    if (balance < lamports) {
      throw new Error(`Solde insuffisant. Nécessaire: ${lamports / LAMPORTS_PER_SOL} SOL, Disponible: ${balance / LAMPORTS_PER_SOL} SOL`);
    }

    const transaction = new Transaction();
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({
      commitment: 'finalized'
    });
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(lamports)
      })
    );

    return transaction;

  } catch (error: any) {
    throw error;
  }
};

export const sendTransaction = async (
  connection: any,
  transaction: Transaction,
  provider: PhantomProvider
): Promise<string> => {
  try {
    console.log("🚀 Envoi de la transaction...");
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({
      commitment: 'finalized'
    });
    transaction.recentBlockhash = blockhash;

    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'finalized',
        maxRetries: 5
      }
    );
    
    console.log("⏳ Attente de la confirmation de la transaction...");
    
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, {
      commitment: 'finalized',
      maxRetries: 3
    });
    
    if (confirmation.value.err) {
      console.error("❌ Erreur lors de la confirmation:", confirmation.value.err);
      throw new Error("La transaction a échoué lors de la confirmation");
    }

    console.log("✅ Transaction confirmée!");
    
    // Attendre un peu pour s'assurer que la transaction est bien finalisée
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return signature;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la transaction:", error);
    throw error;
  }
};