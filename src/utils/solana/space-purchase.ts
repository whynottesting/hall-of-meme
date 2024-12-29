import { supabase } from "@/integrations/supabase/client";
import { createSolanaTransaction } from "./transaction-service";
import { toast } from "@/hooks/use-toast";
import { PhantomWindow } from "./types";

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
      return false;
    }

    const lamports = Math.floor(spaceData.price * 1000000000); // LAMPORTS_PER_SOL
    const signature = await createSolanaTransaction(
      provider,
      "DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs",
      lamports
    );

    if (!signature) {
      throw new Error("La transaction n'a pas pu être créée");
    }

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