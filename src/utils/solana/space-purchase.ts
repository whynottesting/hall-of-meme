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
    console.log("💰 Prix total:", spaceData.price, "SOL");

    // Vérifier si l'espace est disponible
    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('*')
      .or(`x.gte.${spaceData.x},x.lte.${spaceData.x + spaceData.width - 1}`);

    if (!existingSpaces) {
      throw new Error("Erreur lors de la vérification de l'espace");
    }

    // Vérification manuelle du chevauchement
    const hasOverlap = existingSpaces.some(existingSpace => {
      const newSpaceRight = spaceData.x + spaceData.width;
      const newSpaceBottom = spaceData.y + spaceData.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      const overlaps = !(
        spaceData.x >= existingSpaceRight ||
        newSpaceRight <= existingSpace.x ||
        spaceData.y >= existingSpaceBottom ||
        newSpaceBottom <= existingSpace.y
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

    const totalPriceInLamports = Math.floor(spaceData.price * 1_000_000_000);
    console.log("💰 Prix en lamports:", totalPriceInLamports);

    const transaction = await createSolanaTransaction(
      provider,
      "DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs",
      totalPriceInLamports
    );

    if (!transaction) {
      throw new Error("La transaction n'a pas pu être créée");
    }

    console.log("✍️ Transaction créée, demande de signature...");
    
    const signedTransaction = await provider.signTransaction(transaction);
    
    if (!signedTransaction) {
      throw new Error("La transaction n'a pas été signée");
    }

    console.log("📤 Transaction signée, envoi en cours...");

    const connection = SolanaConnection.getInstance().getConnection();
    const signature = await sendTransaction(connection, signedTransaction, provider);

    console.log("💾 Transaction réussie, enregistrement des données...");

    // Attendre un peu pour s'assurer que la transaction est bien finalisée
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    const { data: updatedSpaces } = await supabase
      .from('spaces')
      .select('*');

    if (updatedSpaces) {
      toast({
        title: "Achat réussi!",
        description: "Votre espace a été acheté avec succès.",
      });
      return { success: true, spaces: updatedSpaces };
    }

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