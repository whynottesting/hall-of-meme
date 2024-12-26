import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from '@solana/web3.js';
import { Buffer } from 'buffer';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Utiliser l'endpoint public de mainnet via clusterApiUrl
const connection = new Connection(clusterApiUrl('mainnet-beta'), {
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

    console.log("🔄 Démarrage de la transaction sur mainnet...");
    console.log("💰 Montant demandé en lamports:", lamports);
    console.log("📍 Adresse du wallet:", provider.publicKey.toString());
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);

    // Vérifier le solde avant la transaction
    console.log("🔍 Vérification du solde...");
    const balance = await connection.getBalance(fromPubkey, 'confirmed');
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log("💰 Solde actuel:", balanceInSol, "SOL");
    
    if (balance < lamports) {
      const requiredSol = lamports / LAMPORTS_PER_SOL;
      throw new Error(`Solde insuffisant. Nécessaire: ${requiredSol} SOL, Disponible: ${balanceInSol} SOL`);
    }

    console.log("🔄 Obtention du dernier blockhash...");
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    console.log("✅ Blockhash obtenu:", blockhash);

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
    const signed = await provider.signTransaction(transaction);
    console.log("✍️ Transaction signée");
    
    const signature = await connection.sendRawTransaction(signed.serialize());
    console.log("📤 Transaction envoyée, signature:", signature);
    
    // Attendre la confirmation
    console.log("⏳ Attente de la confirmation...");
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    
    if (confirmation.value.err) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    console.log("🎉 Transaction confirmée sur mainnet!");
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

// Nouvelle fonction pour vérifier le solde
export const checkBalance = async (walletAddress: string): Promise<number> => {
  try {
    console.log("🔍 Vérification du solde pour l'adresse:", walletAddress);
    const pubKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(pubKey, 'confirmed');
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log("💰 Solde trouvé:", balanceInSol, "SOL");
    return balanceInSol;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du solde:", error);
    throw error;
  }
};