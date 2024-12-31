import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Connection,
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from './types';
import { toast } from "@/hooks/use-toast";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 secondes

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
      throw new Error(`Solde insuffisant. Nécessaire: ${lamports / LAMPORTS_PER_SOL} SOL`);
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

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
  provider: PhantomProvider,
  retryCount: number = 0
): Promise<string> => {
  try {
    console.log(`📤 Envoi de la transaction (tentative ${retryCount + 1}/${MAX_RETRIES})...`);
    
    const signedTransaction = await provider.signTransaction(transaction);
    const rawTransaction = signedTransaction.serialize();
    
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3
    });

    console.log("🔍 Attente de la confirmation...");

    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: transaction.recentBlockhash!,
      lastValidBlockHeight: transaction.lastValidBlockHeight!
    }, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(confirmation.value.err.toString());
    }

    console.log("✅ Transaction confirmée!");
    toast({
      title: "Transaction réussie",
      description: "Votre espace a été sécurisé avec succès!",
    });
    
    return signature;

  } catch (error: any) {
    console.error("❌ Erreur de transaction:", error);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`🔄 Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Mise à jour du blockhash pour la nouvelle tentative
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      
      return sendTransaction(connection, transaction, provider, retryCount + 1);
    }

    toast({
      title: "Erreur de transaction",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};