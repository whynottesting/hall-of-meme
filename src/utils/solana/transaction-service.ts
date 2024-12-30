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
    
    console.log("📝 Création de la transaction...");
    console.log("💰 Montant:", lamports / LAMPORTS_PER_SOL, "SOL");
    
    const fromPubkey = provider.publicKey;
    const toPubkey = new PublicKey(recipientAddress);
    
    const balance = await connection.getBalance(fromPubkey);
    console.log("💳 Balance du wallet:", balance / LAMPORTS_PER_SOL, "SOL");
    
    if (balance < lamports) {
      throw new Error(`Solde insuffisant. Nécessaire: ${lamports / LAMPORTS_PER_SOL} SOL, Disponible: ${balance / LAMPORTS_PER_SOL} SOL`);
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    
    const transaction = new Transaction({
      feePayer: fromPubkey,
      blockhash,
      lastValidBlockHeight,
    });

    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(lamports)
      })
    );

    console.log("✅ Transaction créée avec succès");
    return transaction;

  } catch (error: any) {
    console.error("❌ Erreur lors de la création de la transaction:", error);
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
      { 
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: 'processed'
      }
    );
    
    console.log("⏳ Attente de la confirmation de la transaction:", signature);
    
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: transaction.blockhash,
      lastValidBlockHeight: transaction.lastValidBlockHeight,
    }, 'processed');
    
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