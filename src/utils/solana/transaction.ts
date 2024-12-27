import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';
import { SolanaConnection } from './connection';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function getLatestBlockhash(connection: any, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await connection.getLatestBlockhash('confirmed');
    } catch (error) {
      console.error(`❌ Blockhash error attempt ${attempt}/${retries}:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  throw new Error("Could not get blockhash");
}

async function confirmTransaction(
  connection: any,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
  retries = MAX_RETRIES
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });
      
      if (confirmation.value.err) {
        throw new Error("Transaction failed during confirmation");
      }
      
      return confirmation;
    } catch (error) {
      console.error(`❌ Confirmation error attempt ${attempt}/${retries}:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  throw new Error("Could not confirm transaction");
}

export const createSolanaTransaction = async (
  provider: any,
  recipientAddress: string,
  lamports: number
) => {
  const solanaConnection = SolanaConnection.getInstance();
  
  try {
    if (!provider.publicKey) {
      throw new Error("Wallet not connected");
    }

    console.log("🔄 Starting transaction...");
    console.log("💰 Requested amount in lamports:", lamports);
    console.log("📍 Wallet address:", provider.publicKey.toString());
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);
    
    let connection = solanaConnection.getConnection();
    let success = false;
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
      try {
        // Check balance
        const balance = await connection.getBalance(fromPubkey);
        if (balance < lamports) {
          throw new Error(`Insufficient balance. Required: ${lamports / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`);
        }

        // Create and send transaction
        const { blockhash, lastValidBlockHeight } = await getLatestBlockhash(connection);
        
        const transferInstruction = SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: Math.floor(lamports)
        });

        const messageV0 = new TransactionMessage({
          payerKey: fromPubkey,
          recentBlockhash: blockhash,
          instructions: [transferInstruction]
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        
        console.log("📝 Transaction created, signing...");
        const signed = await provider.signTransaction(transaction);
        
        console.log("✍️ Transaction signed, sending...");
        const signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 5
        });
        
        console.log("📤 Transaction sent, confirming...");
        await confirmTransaction(connection, signature, blockhash, lastValidBlockHeight);
        
        console.log("✅ Transaction confirmed!");
        success = true;
        return signature;
        
      } catch (error: any) {
        console.error(`❌ Error on attempt ${attempt}/${MAX_RETRIES}:`, error);
        lastError = error;
        
        if (attempt < MAX_RETRIES) {
          console.log("🔄 Switching to another endpoint...");
          connection = await solanaConnection.switchToNextEndpoint();
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError || new Error("Transaction failed after multiple attempts");
    
  } catch (error: any) {
    console.error("❌ Fatal transaction error:", error);
    throw error;
  }
};