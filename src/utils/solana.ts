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
  // Créer une nouvelle transaction
  const transaction = new Transaction();
  
  // Obtenir un blockhash récent
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = provider.publicKey;

  // Ajouter l'instruction de transfert
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: new PublicKey(recipientAddress),
      lamports
    })
  );

  const { signature } = await provider.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature);
  
  return signature;
};