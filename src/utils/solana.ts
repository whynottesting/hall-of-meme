import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';
import { Buffer } from 'buffer';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Utiliser l'endpoint public de Solana mainnet
const connection = new Connection(clusterApiUrl('mainnet-beta'), {
  commitment: 'processed',
  confirmTransactionInitialTimeout: 120000, // 2 minutes
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
    console.log("📍 Adresse du wallet:", provider.publicKey.toString());
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);

    // Vérifier le solde avant la transaction
    const balance = await connection.getBalance(fromPubkey);
    console.log("💰 Solde actuel:", balance / LAMPORTS_PER_SOL, "SOL");
    
    if (balance < lamports) {
      throw new Error("Solde insuffisant pour effectuer la transaction");
    }

    // Obtenir le dernier blockhash avec plusieurs tentatives
    let blockhash;
    let attempts = 0;
    const maxAttempts = 5;

    while (!blockhash && attempts < maxAttempts) {
      try {
        console.log(`Tentative ${attempts + 1} d'obtention du blockhash...`);
        const { blockhash: newBlockhash, lastValidBlockHeight } = 
          await connection.getLatestBlockhash('processed');
        blockhash = newBlockhash;
        console.log("✅ Blockhash obtenu:", blockhash);
        console.log("📊 Hauteur du dernier bloc valide:", lastValidBlockHeight);
      } catch (error) {
        attempts++;
        console.error(`❌ Échec de la tentative ${attempts}:`, error);
        if (attempts === maxAttempts) {
          throw new Error("Impossible d'obtenir un blockhash valide après plusieurs tentatives");
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Créer et configurer la transaction
    const transaction = new Transaction();
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
    
    // Signer et envoyer la transaction
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log("✍️ Transaction signée et envoyée, signature:", signature);
    
    // Attendre la confirmation avec plusieurs tentatives
    let confirmed = false;
    attempts = 0;

    while (!confirmed && attempts < maxAttempts) {
      try {
        console.log(`Tentative ${attempts + 1} de confirmation...`);
        const confirmation = await connection.confirmTransaction(signature, 'processed');
        
        if (confirmation.value.err) {
          throw new Error("La transaction a échoué lors de la confirmation");
        }
        
        confirmed = true;
        console.log("🎉 Transaction confirmée!");
      } catch (error) {
        attempts++;
        console.error(`❌ Échec de la confirmation, tentative ${attempts}:`, error);
        if (attempts === maxAttempts) {
          throw new Error("Impossible de confirmer la transaction après plusieurs tentatives");
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
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