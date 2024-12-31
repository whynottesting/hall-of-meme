import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { PhantomProvider } from './types';

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
    
    const fromPubkey = provider.publicKey;
    const toPubkey = new PublicKey(recipientAddress);
    
    const balance = await connection.getBalance(fromPubkey);
    if (balance < lamports) {
      throw new Error(`Solde insuffisant. Nécessaire: ${lamports / LAMPORTS_PER_SOL} SOL, Disponible: ${balance / LAMPORTS_PER_SOL} SOL`);
    }

    const transaction = new Transaction();
    
    const { blockhash } = await connection.getLatestBlockhash({
      commitment: 'finalized'
    });
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(lamports)
      })
    );

    return transaction;

  } catch (error: any) {
    throw error;
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const pollForSignatureStatus = async (
  connection: any,
  signature: string,
  maxAttempts = 30,
  interval = 1000
): Promise<boolean> => {
  console.log("🔄 Début du polling pour la signature:", signature);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const signatureStatus = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true
      });
      
      console.log(`📊 Tentative ${attempt + 1}/${maxAttempts}, Status:`, signatureStatus);
      
      if (signatureStatus?.value?.confirmationStatus === 'finalized') {
        if (signatureStatus.value.err) {
          console.error("❌ Transaction finalisée avec erreur:", signatureStatus.value.err);
          return false;
        }
        console.log("✅ Transaction finalisée avec succès!");
        return true;
      }
      
      await sleep(interval);
    } catch (error) {
      console.error(`❌ Erreur lors du polling (tentative ${attempt + 1}):`, error);
      await sleep(interval);
    }
  }
  
  throw new Error("Le délai d'attente pour la confirmation de la transaction a expiré");
};

export const sendTransaction = async (
  connection: any,
  transaction: Transaction,
  provider: PhantomProvider
): Promise<string> => {
  try {
    console.log("🚀 Envoi de la transaction...");
    
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'finalized',
        maxRetries: 3
      }
    );
    
    console.log("📝 Signature de la transaction:", signature);
    console.log("⏳ Attente de la confirmation...");
    
    const isConfirmed = await pollForSignatureStatus(connection, signature);
    
    if (!isConfirmed) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    // Attendre un peu pour s'assurer que la transaction est bien finalisée
    await sleep(2000);
    
    return signature;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la transaction:", error);
    throw error;
  }
};