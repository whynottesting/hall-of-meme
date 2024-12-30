import { supabase } from "@/integrations/supabase/client";
import { createSolanaTransaction, sendTransaction } from "./transaction-service";
import { toast } from "@/hooks/use-toast";
import { PhantomProvider } from "./types";
import { SolanaConnection } from './connection';

export const handleSpacePurchase = async (
  provider: PhantomProvider | null,
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
    if (!provider) {
      throw new Error("Phantom Wallet non connecté");
    }

    console.log("🚀 Démarrage de l'achat d'espace...");
    console.log("📦 Données de l'espace:", spaceData);

    // Vérifier si l'espace est disponible avec une logique de chevauchement correcte
    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('*')
      .or(
        `and(x,lt.${spaceData.x + spaceData.width},x.plus.width,gt.${spaceData.x}),` +
        `and(y,lt.${spaceData.y + spaceData.height},y.plus.height,gt.${spaceData.y})`
      );

    console.log("🔍 Espaces existants trouvés:", existingSpaces);

    if (existingSpaces && existingSpaces.length > 0) {
      console.log("❌ Espace déjà occupé:", existingSpaces);
      toast({
        title: "Espace déjà occupé",
        description: "Cet espace a déjà été acheté. Veuillez en choisir un autre.",
        variant: "destructive",
      });
      return false;
    }

    // Créer et signer la transaction
    const lamports = Math.floor(spaceData.price * 1000000000);
    const transaction = await createSolanaTransaction(
      provider,
      "DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs",
      lamports
    );

    if (!transaction) {
      throw new Error("La transaction n'a pas pu être créée");
    }

    console.log("✍️ Transaction créée, demande de signature...");
    
    // Demander la signature à l'utilisateur via Phantom
    const signedTransaction = await provider.signTransaction(transaction);
    
    if (!signedTransaction) {
      throw new Error("La transaction n'a pas été signée");
    }

    console.log("📤 Transaction signée, envoi en cours...");

    // Envoyer la transaction signée
    const connection = SolanaConnection.getInstance().getConnection();
    const signature = await sendTransaction(connection, signedTransaction, provider);

    console.log("💾 Transaction réussie, enregistrement des données...");

    // Enregistrer la transaction dans l'historique
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert({
        wallet_address: provider.publicKey.toString(),
        status: 'completed',
        space_id: null
      });

    if (transactionError) {
      console.error("Erreur lors de l'enregistrement de la transaction:", transactionError);
      throw transactionError;
    }

    console.log("📝 Enregistrement de l'espace...");
    console.log("Données de l'espace à enregistrer:", {
      wallet_address: provider.publicKey.toString(),
      x: spaceData.x,
      y: spaceData.y,
      width: spaceData.width,
      height: spaceData.height,
      url: spaceData.link,
      image_url: spaceData.imageUrl,
      price: spaceData.price
    });

    // Enregistrer l'espace acheté
    const { data: newSpace, error: spaceError } = await supabase
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
      })
      .select()
      .single();

    if (spaceError) {
      console.error("Erreur lors de l'enregistrement de l'espace:", spaceError);
      throw spaceError;
    }

    console.log("✅ Espace enregistré avec succès:", newSpace);

    // Recharger immédiatement les données après l'enregistrement
    const { data: updatedSpaces } = await supabase
      .from('spaces')
      .select('*');

    if (updatedSpaces) {
      // Mettre à jour le state avec les nouvelles données
      return { success: true, spaces: updatedSpaces };
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