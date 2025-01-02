import { supabase } from "@/integrations/supabase/client";

export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  try {
    // Télécharger l'image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('space-images')
      .upload(fileName, blob);

    if (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    }

    return fileName;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    throw error;
  }
}