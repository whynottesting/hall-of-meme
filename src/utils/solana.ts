import { 
  Connection, 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';

// Liste de RPC endpoints de backup
const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana"
];

// Fonction pour créer une nouvelle connexion
const createConnection = (endpoint: string) => {
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
    httpHeaders: {
      'Content-Type': 'application/json',
    }
  });
};

// Initialiser avec le premier endpoint
let currentEndpointIndex = 0;
let connection = createConnection(RPC_ENDPOINTS[currentEndpointIndex]);

// Fonction pour basculer vers le prochain endpoint disponible
const switchToNextEndpoint = () => {
  currentEndpointIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
  const newEndpoint = RPC_ENDPOINTS[currentEndpointIndex];
  console.log(`🔄 Basculement vers le RPC endpoint: ${newEndpoint}`);
  connection = createConnection(newEndpoint);
  return connection;
};

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
      console.error(`❌ Erreur lors de la tentative ${i + 1}/${attempts}:`, error);
      if (i === attempts - 1) {
        if (currentEndpointIndex < RPC_ENDPOINTS.length - 1) {
          switchToNextEndpoint();
          return getBalanceWithRetry(pubKey, attempts); // Réessayer avec le nouveau endpoint
        }
        throw error;
      }
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
      console.error(`❌ Erreur lors de la tentative ${i + 1}/${attempts}:`, error);
      if (i === attempts - 1) {
        if (currentEndpointIndex < RPC_ENDPOINTS.length - 1) {
          switchToNextEndpoint();
          return getLatestBlockhashWithRetry(attempts); // Réessayer avec le nouveau endpoint
        }
        throw error;
      }
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
      console.error(`❌ Erreur lors de la tentative ${i + 1}/${attempts}:`, error);
      if (i === attempts - 1) {
        if (currentEndpointIndex < RPC_ENDPOINTS.length - 1) {
          switchToNextEndpoint();
          return confirmTransactionWithRetry(signature, blockhash, lastValidBlockHeight, attempts);
        }
        throw error;
      }
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