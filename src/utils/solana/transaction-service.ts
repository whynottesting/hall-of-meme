import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from './types';

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

    console.log("🔄 Démarrage de la création de transaction...");
    console.log("💰 Montant demandé en lamports:", lamports);
    console.log("📍 Adresse du wallet:", provider.publicKey.toString());
    
    const fromPubkey = provider.publicKey;
    const toPubkey = new PublicKey(recipientAddress);
    
    // Vérifier le solde
    const balance = await connection.getBalance(fromPubkey);
    if (balance < lamports) {
      throw new Error(`Solde insuffisant. Nécessaire: ${lamports / LAMPORTS_PER_SOL} SOL, Disponible: ${balance / LAMPORTS_PER_SOL} SOL`);
    }

    // Créer la transaction
    const transaction = new Transaction();
    
    // Obtenir le dernier blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Ajouter l'instruction de transfert
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(lamports)
      })
    );

    console.log("📝 Transaction créée avec succès");
    return transaction;

  } catch (error: any) {
    console.error("❌ Erreur lors de la création de la transaction:", error);
    throw error;
  }
};

export const sendTransaction = async (
  connection: any,
  transaction: Transaction,
  provider: PhantomProvider
): Promise<string> => {
  try {
    console.log("🚀 Envoi de la transaction signée...");
    const signature = await connection.sendRawTransaction(
      transaction.serialize()
    );
    
    console.log("⏳ Attente de la confirmation de la transaction...");
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    console.log("✅ Transaction confirmée avec succès!");
    return signature;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la transaction:", error);
    throw error;
  }
};