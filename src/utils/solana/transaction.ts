import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { RPC_CONFIG, TRANSACTION_CONFIG } from './config';
import { toast } from "@/hooks/use-toast";

const getLatestBlockhash = async (connection: any) => {
  try {
    return await connection.getLatestBlockhash('confirmed');
  } catch (error) {
    console.error('❌ Error getting blockhash:', error);
    throw error;
  }
};

const confirmTransaction = async (
  connection: any,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number
) => {
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
    console.error('❌ Error confirming transaction:', error);
    throw error;
  }
};

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
    
    for (let attempt = 1; attempt <= TRANSACTION_CONFIG.MAX_RETRIES && !success; attempt++) {
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
          preflightCommitment: TRANSACTION_CONFIG.PREFLIGHT_COMMITMENT,
          maxRetries: 5
        });
        
        console.log("📤 Transaction sent, confirming...");
        await confirmTransaction(connection, signature, blockhash, lastValidBlockHeight);
        
        console.log("✅ Transaction confirmed!");
        success = true;
        return signature;
        
      } catch (error: any) {
        console.error(`❌ Error on attempt ${attempt}/${TRANSACTION_CONFIG.MAX_RETRIES}:`, error);
        lastError = error;
        
        if (attempt < TRANSACTION_CONFIG.MAX_RETRIES) {
          console.log("🔄 Switching to another endpoint...");
          connection = await solanaConnection.switchToNextEndpoint();
          await new Promise(resolve => setTimeout(resolve, RPC_CONFIG.INITIAL_BACKOFF * attempt));
        }
      }
    }
    
    const errorMessage = lastError?.message || "Transaction failed after multiple attempts";
    toast({
      title: "Erreur de transaction",
      description: errorMessage,
      variant: "destructive",
    });
    throw new Error(errorMessage);
    
  } catch (error: any) {
    console.error("❌ Fatal transaction error:", error);
    throw error;
  }
};