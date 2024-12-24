import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const SOLANA_NETWORK = 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_NETWORK);

export const createSolanaTransaction = async (
  provider: any,
  recipientAddress: string,
  lamports: number
) => {
  const transaction = new Transaction().add(
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