import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from '@/hooks/usePhantomWallet';

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
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
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