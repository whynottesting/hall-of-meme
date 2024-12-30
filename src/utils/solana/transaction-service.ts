import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  Connection
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from './types';
import { toast } from "@/hooks/use-toast";

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

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
    
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
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
  connection: Connection,
  transaction: Transaction,
  provider: PhantomProvider
): Promise<string> => {
  try {
    console.log("📤 Envoi de la transaction...");
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      { skipPreflight: false, maxRetries: 3 }
    );
    
    console.log("⏳ Attente de la confirmation de la transaction:", signature);
    const confirmation = await connection.confirmTransaction(
      signature,
      'confirmed'
    );
    
    if (confirmation.value.err) {
      console.error("❌ Erreur lors de la confirmation:", confirmation.value.err);
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    console.log("✅ Transaction confirmée!");
    toast({
      title: "Transaction réussie",
      description: "Votre espace a été sécurisé avec succès!",
    });
    
    return signature;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la transaction:", error);
    throw error;
  }
};
