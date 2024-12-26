import { Buffer } from 'buffer';
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl,
  sendAndConfirmTransaction
} from '@solana/web3.js';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Utiliser le réseau mainnet au lieu de devnet
const SOLANA_NETWORK = clusterApiUrl('mainnet-beta');
const connection = new Connection(SOLANA_NETWORK, 'confirmed');

export const createSolanaTransaction = async (
  provider: any,
  recipientAddress: string,
  lamports: number
) => {
  try {
    if (!provider.publicKey) {
      throw new Error("Wallet non connecté");
    }

    console.log("🔄 Démarrage de la transaction...");
    console.log("💰 Montant demandé en lamports:", lamports);
    console.log("📍 Réseau Solana:", SOLANA_NETWORK);
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);
    
    // Vérifier le solde du wallet
    const balance = await connection.getBalance(fromPubkey);
    console.log("💳 Solde du wallet (lamports):", balance);
    console.log("💳 Solde du wallet (SOL):", balance / LAMPORTS_PER_SOL);
    
    // Frais de transaction estimés (0.000005 SOL = 5000 lamports)
    const estimatedFees = 5000;
    const totalAmount = lamports + estimatedFees;
    
    if (balance < totalAmount) {
      const solNeeded = (totalAmount / LAMPORTS_PER_SOL).toFixed(4);
      const currentBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
      throw new Error(`Solde insuffisant. Vous avez ${currentBalance} SOL mais avez besoin d'au moins ${solNeeded} SOL (incluant les frais de transaction)`);
    }

    // Créer la transaction
    const transaction = new Transaction();
    
    // Obtenir le dernier blockhash
    const { blockhash } = await connection.getLatestBlockhash('finalized');
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

    console.log("📝 Transaction créée, en attente de signature...");
    
    // Signer et envoyer la transaction via Phantom
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log("✍️ Transaction signée et envoyée, signature:", signature);
    
    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction(signature);
    console.log("🎉 Confirmation reçue:", confirmation);
    
    if (confirmation.value.err) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    return signature;

  } catch (error: any) {
    console.error("❌ Erreur détaillée de la transaction:", error);
    
    if (error.message.includes("insufficient funds")) {
      throw new Error("Solde insuffisant pour effectuer la transaction");
    } else if (error.message.includes("blockhash")) {
      throw new Error("Erreur de blockhash - Veuillez réessayer");
    } else if (error.message.includes("timeout")) {
      throw new Error("La transaction a expiré - Veuillez réessayer");
    }
    
    throw error;
  }
};