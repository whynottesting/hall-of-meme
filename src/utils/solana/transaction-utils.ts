import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';
import { SolanaRPCConnection } from './rpc-config';
import { toast } from "@/hooks/use-toast";

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

async function getLatestBlockhash(connection: any, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await connection.getLatestBlockhash('confirmed');
    } catch (error) {
      console.error(`❌ Erreur blockhash tentative ${attempt}/${retries}:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error("Impossible d'obtenir le blockhash");
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
        throw new Error("La transaction a échoué lors de la confirmation");
      }
      
      return confirmation;
    } catch (error) {
      console.error(`❌ Erreur confirmation tentative ${attempt}/${retries}:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error("Impossible de confirmer la transaction");
}

export const createSolanaTransaction = async (
  provider: any,
  recipientAddress: string,
  lamports: number
) => {
  const rpcConnection = SolanaRPCConnection.getInstance();
  
  try {
    if (!provider.publicKey) {
      throw new Error("Wallet non connecté");
    }

    console.log("🔄 Démarrage de la transaction...");
    console.log("💰 Montant demandé en lamports:", lamports);
    console.log("📍 Adresse du wallet:", provider.publicKey.toString());
    
    const fromPubkey = new PublicKey(provider.publicKey.toString());
    const toPubkey = new PublicKey(recipientAddress);
    
    let connection = rpcConnection.getConnection();
    let success = false;
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
      try {
        // Vérifier le solde
        const balance = await connection.getBalance(fromPubkey);
        if (balance < lamports) {
          throw new Error(`Solde insuffisant. Nécessaire: ${lamports / LAMPORTS_PER_SOL} SOL, Disponible: ${balance / LAMPORTS_PER_SOL} SOL`);
        }

        // Créer et envoyer la transaction
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
        
        console.log("📝 Transaction créée, signature en cours...");
        const signed = await provider.signTransaction(transaction);
        
        console.log("✍️ Transaction signée, envoi en cours...");
        const signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: true,
          maxRetries: 5
        });
        
        console.log("📤 Transaction envoyée, confirmation en cours...");
        await confirmTransaction(connection, signature, blockhash, lastValidBlockHeight);
        
        console.log("✅ Transaction confirmée!");
        success = true;
        return signature;
        
      } catch (error: any) {
        console.error(`❌ Erreur lors de la tentative ${attempt}/${MAX_RETRIES}:`, error);
        lastError = error;
        
        if (attempt < MAX_RETRIES) {
          console.log("🔄 Basculement vers un autre endpoint...");
          connection = await rpcConnection.switchToNextEndpoint();
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
    
    throw lastError || new Error("La transaction a échoué après plusieurs tentatives");
    
  } catch (error: any) {
    console.error("❌ Erreur fatale de la transaction:", error);
    throw error;
  }
};

export const handleSpacePurchase = async (
  provider: any,
  spaceData: {
    x: number;
    y: number;
    width: number;
    height: number;
    price: number;
    imageUrl?: string;
    link?: string;
  }
) => {
  try {
    console.log("🚀 Démarrage de l'achat d'espace...");
    console.log("📦 Données de l'espace:", spaceData);

    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('*')
      .or(`and(x.gte.${spaceData.x},x.lt.${spaceData.x + spaceData.width}),and(y.gte.${spaceData.y},y.lt.${spaceData.y + spaceData.height})`);

    if (existingSpaces && existingSpaces.length > 0) {
      toast({
        title: "Espace déjà occupé",
        description: "Cet espace a déjà été acheté. Veuillez en choisir un autre.",
        variant: "destructive",
      });
      return;
    }

    const lamports = Math.floor(spaceData.price * LAMPORTS_PER_SOL);
    const signature = await createSolanaTransaction(
      provider,
      "DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs",
      lamports
    );

    if (!signature) {
      throw new Error("La transaction n'a pas pu être créée");
    }

    // Enregistrer la transaction dans l'historique
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert({
        wallet_address: provider.publicKey.toString(),
        status: 'completed'
      });

    if (transactionError) {
      console.error("Erreur lors de l'enregistrement de la transaction:", transactionError);
      throw transactionError;
    }

    // Enregistrer l'espace acheté
    const { error: spaceError } = await supabase
      .from('spaces')
      .insert({
        wallet_address: provider.publicKey.toString(),
        x: spaceData.x,
        y: spaceData.y,
        width: spaceData.width,
        height: spaceData.height,
        url: spaceData.link,
        image_url: spaceData.imageUrl,
        price: spaceData.price
      });

    if (spaceError) {
      console.error("Erreur lors de l'enregistrement de l'espace:", spaceError);
      throw spaceError;
    }

    toast({
      title: "Achat réussi!",
      description: "Votre espace a été acheté avec succès.",
    });

    return true;
  } catch (error: any) {
    console.error("❌ Erreur lors de l'achat:", error);
    toast({
      title: "Erreur lors de l'achat",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
};