import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const handleImageUpload = async (file: File) => {
    try {
      console.log('Début du téléchargement de l\'image:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Vérifier la taille du fichier (5MB max)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Image trop volumineuse",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Vérifier si le fichier est une image
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Upload du fichier
      console.log('Tentative d\'upload vers Supabase Storage...');
      const { data, error: uploadError } = await supabase.storage
        .from('space-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload réussi, récupération de l\'URL publique...');
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('space-images')
        .getPublicUrl(fileName);

      // Ajouter un timestamp pour éviter le cache du navigateur
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      console.log('URL de l\'image générée:', finalUrl);

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