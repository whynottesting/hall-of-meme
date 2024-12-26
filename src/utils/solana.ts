import { Buffer } from 'buffer';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const SOLANA_NETWORK = 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_NETWORK);

export const createSolanaTransaction = async (
  provider: any,
  recipientAddress: string,
  lamports: number
) => {
  try {
    console.log("🔄 Démarrage de la transaction...");
    console.log("💰 Montant en lamports:", lamports);
    
    // Vérifier le solde du wallet
    const balance = await connection.getBalance(provider.publicKey);
    console.log("💳 Solde du wallet (lamports):", balance);
    
    // Frais de transaction estimés (0.000005 SOL = 5000 lamports)
    const estimatedFees = 5000;
    const requiredBalance = lamports + estimatedFees;
    console.log("💰 Solde requis avec frais (lamports):", requiredBalance);
    
    if (balance < requiredBalance) {
      const solNeeded = (requiredBalance / 1000000000).toFixed(4);
      const currentBalance = (balance / 1000000000).toFixed(4);
      throw new Error(`Solde insuffisant. Vous avez ${currentBalance} SOL mais avez besoin d'au moins ${solNeeded} SOL (incluant les frais de transaction)`);
    }

    // Créer une nouvelle transaction
    const transaction = new Transaction();
    
    // Obtenir un blockhash récent
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    console.log("🔑 Blockhash obtenu:", blockhash);
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.publicKey;

    // Ajouter l'instruction de transfert
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(lamports) // S'assurer que le montant est un entier
      })
    );

    console.log("📝 Transaction créée, en attente de signature...");
    
    // Signer et envoyer la transaction
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log("✍️ Transaction signée, signature:", signature);
    
    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight: await connection.getBlockHeight()
    }, 'confirmed');
    
    console.log("🎉 Confirmation reçue:", confirmation);
    
    if (confirmation.value.err) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    return signature;
  } catch (error: any) {
    console.error("❌ Erreur détaillée de la transaction:", error);
    
    // Améliorer les messages d'erreur
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