import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';

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

    console.log("🔄 Création de la transaction...");
    
    // Obtenir le dernier blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    
    // Créer l'instruction de transfert
    const transferInstruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: Math.floor(lamports)
    });

    // Créer le message de la transaction
    const messageV0 = new TransactionMessage({
      payerKey: fromPubkey,
      recentBlockhash: blockhash,
      instructions: [transferInstruction]
    }).compileToV0Message();

    // Créer la transaction versionnée
    const transaction = new VersionedTransaction(messageV0);

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
    throw error;
  }
};

// Fonction pour vérifier le solde
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