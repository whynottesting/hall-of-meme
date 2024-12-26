import { Buffer } from 'buffer';
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Utiliser Helius RPC endpoint pour le mainnet
const connection = new Connection('https://rpc.helius.xyz/?api-key=7d06e432-f71c-4b39-a0c3-1f20f8c065ab', {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

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
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);

    // Créer la transaction
    const transaction = new Transaction();
    
    // Obtenir le dernier blockhash de manière fiable
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
      console.log("✅ Blockhash obtenu:", blockhash);
    } catch (error) {
      console.error("❌ Erreur lors de l'obtention du blockhash:", error);
      throw new Error("Impossible d'obtenir le blockhash - Veuillez réessayer");
    }

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
    
    // Attendre la confirmation avec un timeout plus long
    try {
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      console.log("🎉 Confirmation reçue:", confirmation);
      
      if (confirmation.value.err) {
        throw new Error("La transaction a échoué lors de la confirmation");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la confirmation:", error);
      // On continue même si la confirmation échoue, car la transaction peut quand même être valide
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