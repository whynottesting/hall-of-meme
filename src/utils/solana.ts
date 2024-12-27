import { 
  Connection, 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';

// Utiliser Helius comme RPC provider (plus fiable que l'endpoint public)
const RPC_ENDPOINT = "https://rpc.helius.xyz/?api-key=1ff71cd7-0e0f-4d4c-8c35-7794b790d3c5";

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  httpHeaders: {
    'Content-Type': 'application/json',
  }
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

    // Vérifier le solde avec retry
    const balance = await getBalanceWithRetry(fromPubkey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log("💰 Solde actuel:", balanceInSol, "SOL");
    
    if (balance < lamports) {
      const requiredSol = lamports / LAMPORTS_PER_SOL;
      throw new Error(`Solde insuffisant. Nécessaire: ${requiredSol} SOL, Disponible: ${balanceInSol} SOL`);
    }

    console.log("🔄 Création de la transaction...");
    
    // Obtenir le dernier blockhash avec retry
    const { blockhash, lastValidBlockHeight } = await getLatestBlockhashWithRetry();
    
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
    
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: true, // Éviter les vérifications préalables qui peuvent échouer
      maxRetries: 5
    });
    console.log("📤 Transaction envoyée, signature:", signature);
    
    // Attendre la confirmation avec retry
    const confirmation = await confirmTransactionWithRetry(signature, blockhash, lastValidBlockHeight);
    
    if (confirmation.value.err) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    console.log("🎉 Transaction confirmée!");
    return signature;

  } catch (error: any) {
    console.error("❌ Erreur détaillée de la transaction:", error);
    throw error;
  }
};

// Fonction utilitaire pour réessayer la vérification du solde
const getBalanceWithRetry = async (pubKey: PublicKey, attempts = 3): Promise<number> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const balance = await connection.getBalance(pubKey, 'confirmed');
      return balance;
    } catch (error) {
      if (i === attempts - 1) throw error;
      console.log(`Tentative de vérification du solde échouée, nouvel essai... (${i + 1}/${attempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Impossible de vérifier le solde après plusieurs tentatives");
};

// Fonction utilitaire pour réessayer l'obtention du dernier blockhash
const getLatestBlockhashWithRetry = async (attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await connection.getLatestBlockhash('confirmed');
    } catch (error) {
      if (i === attempts - 1) throw error;
      console.log(`Tentative d'obtention du blockhash échouée, nouvel essai... (${i + 1}/${attempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Impossible d'obtenir le dernier blockhash après plusieurs tentatives");
};

// Fonction utilitaire pour réessayer la confirmation de transaction
const confirmTransactionWithRetry = async (
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
  attempts = 3
) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });
    } catch (error) {
      if (i === attempts - 1) throw error;
      console.log(`Tentative de confirmation échouée, nouvel essai... (${i + 1}/${attempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Impossible de confirmer la transaction après plusieurs tentatives");
};

export const checkBalance = async (walletAddress: string): Promise<number> => {
  try {
    console.log("🔍 Vérification du solde pour l'adresse:", walletAddress);
    const pubKey = new PublicKey(walletAddress);
    
    const balance = await getBalanceWithRetry(pubKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log("💰 Solde trouvé:", balanceInSol, "SOL");
    return balanceInSol;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du solde:", error);
    throw error;
  }
};