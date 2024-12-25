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
  try {
    // Vérifier le solde du wallet
    const balance = await connection.getBalance(provider.publicKey);
    
    // Ajouter une marge pour les frais de transaction (0.000005 SOL)
    const requiredBalance = lamports + 5000;
    
    if (balance < requiredBalance) {
      throw new Error(`Solde insuffisant. Vous avez besoin d'au moins ${(requiredBalance / 1000000000).toFixed(4)} SOL`);
    }

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

    // Signer et envoyer la transaction
    const { signature } = await provider.signAndSendTransaction(transaction);
    
    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error("La transaction a échoué lors de la confirmation");
    }
    
    return signature;
  } catch (error: any) {
    console.error("Erreur lors de la création de la transaction:", error);
    throw new Error(error.message || "Erreur lors de la transaction Solana");
  }
};