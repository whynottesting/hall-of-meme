import { Buffer } from 'buffer';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const SOLANA_NETWORK = clusterApiUrl('devnet');
const connection = new Connection(SOLANA_NETWORK);

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
    
    // Vérifier le solde du wallet
    const walletPubKey = new PublicKey(provider.publicKey.toString());
    const balance = await connection.getBalance(walletPubKey);
    console.log("💳 Solde du wallet (lamports):", balance);
    console.log("💳 Solde du wallet (SOL):", balance / LAMPORTS_PER_SOL);
    
    // Frais de transaction estimés (0.000005 SOL = 5000 lamports)
    const estimatedFees = 5000;
    const requiredBalance = lamports + estimatedFees;
    console.log("💰 Solde requis avec frais (lamports):", requiredBalance);
    
    if (balance < requiredBalance) {
      const solNeeded = (requiredBalance / LAMPORTS_PER_SOL).toFixed(4);
      const currentBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
      throw new Error(`Solde insuffisant. Vous avez ${currentBalance} SOL mais avez besoin d'au moins ${solNeeded} SOL (incluant les frais de transaction)`);
    }

    // Créer une nouvelle transaction
    const transaction = new Transaction();
    
    // Obtenir un blockhash récent
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    console.log("🔑 Blockhash obtenu:", blockhash);
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubKey;

    // Ajouter l'instruction de transfert
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPubKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(lamports)
      })
    );

    console.log("📝 Transaction créée, en attente de signature...");
    
    // Signer et envoyer la transaction
    const signed = await provider.signTransaction(transaction);
    console.log("✍️ Transaction signée");
    
    const signature = await connection.sendRawTransaction(signed.serialize());
    console.log("🚀 Transaction envoyée, signature:", signature);
    
    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    
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