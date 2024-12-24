import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Vérifier si le fichier est une image
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Upload du fichier
      const { data, error } = await supabase.storage
        .from('space-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      // Obtenir l'URL publique avec le bon cache control
      const { data: { publicUrl } } = supabase.storage
        .from('space-images')
        .getPublicUrl(fileName, {
          download: false,
          transform: {
            quality: 75, // Optimiser la qualité pour mobile
            format: 'webp' // Utiliser un format moderne
          }
        });

      // Ajouter un timestamp pour éviter le cache du navigateur
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      console.log('Image URL générée:', finalUrl);

      toast({
        title: "Image Téléchargée",
        description: "Votre image a été téléchargée avec succès",
      });

      return finalUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
      return null;
    }
  };

  return { handleImageUpload };
};