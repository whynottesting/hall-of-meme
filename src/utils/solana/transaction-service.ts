import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
  Commitment
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from './types';
import { toast } from "@/hooks/use-toast";

const MAX_RETRIES = 3;
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

    // Utiliser 'confirmed' comme niveau d'engagement pour un meilleur équilibre
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
  provider: PhantomProvider
): Promise<string> => {
  try {
    console.log("📤 Envoi de la transaction...");
    
    // Signer la transaction
    const signedTransaction = await provider.signTransaction(transaction);
    const rawTransaction = signedTransaction.serialize();
    
    // Envoyer la transaction avec des options optimisées
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: MAX_RETRIES
    });

    console.log("⏳ Attente de la confirmation de la transaction:", signature);

    // Nouvelle stratégie de confirmation avec retry
    let confirmed = false;
    let retries = 0;

    while (!confirmed && retries < MAX_RETRIES) {
      try {
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: transaction.recentBlockhash,
            lastValidBlockHeight: transaction.lastValidBlockHeight
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          throw new Error(confirmation.value.err.toString());
        }

        confirmed = true;
        console.log("✅ Transaction confirmée!");
        
        // Vérification supplémentaire
        const confirmedTx = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed'
        });

        if (!confirmedTx) {
          throw new Error("La transaction n'a pas pu être vérifiée");
        }

        toast({
          title: "Transaction réussie",
          description: "Votre espace a été sécurisé avec succès!",
        });
        
        return signature;
      } catch (error) {
        console.warn(`Tentative ${retries + 1}/${MAX_RETRIES} échouée:`, error);
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw error;
        }
      }
    }

    throw new Error("Nombre maximum de tentatives de confirmation atteint");
  } catch (error: any) {
    console.error("❌ Erreur lors de l'envoi ou de la confirmation de la transaction:", error);
    toast({
      title: "Erreur de transaction",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};