import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const handleImageUpload = async (file: File) => {
    try {
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
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      console.log("📤 Début de l'upload de l'image...");

      const { data, error: uploadError } = await supabase.storage
        .from('space-images')
        .upload(`public/lovable-uploads/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Erreur d'upload:", uploadError);
        throw uploadError;
      }

      console.log("✅ Image uploadée avec succès:", data);
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('space-images')
        .getPublicUrl(`public/lovable-uploads/${fileName}`);

      console.log("🌐 URL publique générée:", publicUrl);

      toast({
        title: "Image Téléchargée",
        description: "Votre image a été téléchargée avec succès",
      });

      // Retourner directement l'URL publique au lieu du chemin de stockage
      return publicUrl;
    } catch (error) {
      console.error("❌ Erreur lors de l'upload:", error);
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