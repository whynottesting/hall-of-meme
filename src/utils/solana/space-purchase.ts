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
    const { data: existingSpaces, error: checkError } = await supabase
      .from('spaces')
      .select('*')
      .or(
        `x,lt,${spaceData.x + spaceData.width},and(x_plus_width,gt,${spaceData.x})`,
        `y,lt,${spaceData.y + spaceData.height},and(y_plus_height,gt,${spaceData.y})`
      )
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Exclure l'ID par défaut si nécessaire

    if (checkError) {
      console.error('Error checking space availability:', checkError);
      throw checkError;
    }

    // Vérification manuelle du chevauchement
    const hasOverlap = existingSpaces?.some(existingSpace => {
      const newSpaceRight = spaceData.x + spaceData.width;
      const newSpaceBottom = spaceData.y + spaceData.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      // Vérifie si les rectangles se chevauchent
      const overlaps = !(
        spaceData.x >= existingSpaceRight ||  // Nouveau à droite de l'existant
        newSpaceRight <= existingSpace.x ||    // Nouveau à gauche de l'existant
        spaceData.y >= existingSpaceBottom ||  // Nouveau en dessous de l'existant
        newSpaceBottom <= existingSpace.y      // Nouveau au-dessus de l'existant
      );

      if (overlaps) {
        console.log("🚫 Chevauchement détecté avec l'espace:", existingSpace);
      }

      return overlaps;
    });

    if (hasOverlap) {
      console.log("❌ Espace déjà occupé");
      toast({
        title: "Espace déjà occupé",
        description: "Cet espace chevauche un espace déjà acheté. Veuillez en choisir un autre.",
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