import { useCallback, useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { Space } from '@/utils/solana/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useSpaces = () => {
  const [ownedSpaces, setOwnedSpaces] = useState<Space[]>([]);
  const spaceSelection = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const { data: spaces, isLoading } = useSupabaseQuery('spaces');

  useEffect(() => {
    console.log("🔄 Chargement initial des espaces:", spaces);
    if (spaces) {
      setOwnedSpaces(spaces);
    }
  }, [spaces]);

  const loadOwnedSpaces = useCallback(() => {
    if (spaces) {
      console.log("♻️ Rechargement manuel des espaces:", spaces);
      setOwnedSpaces(spaces);
    }
  }, [spaces]);

  const checkSpaceOverlap = useCallback((newSpace: Space) => {
    return ownedSpaces.some(existingSpace => {
      const newSpaceRight = newSpace.x + newSpace.width;
      const newSpaceBottom = newSpace.y + newSpace.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      const xOverlap = newSpace.x < existingSpaceRight && newSpaceRight > existingSpace.x;
      const yOverlap = newSpace.y < existingSpaceBottom && newSpaceBottom > existingSpace.y;

      return xOverlap && yOverlap;
    });
  }, [ownedSpaces]);

  const handleSpaceImageUpload = async (file: File, spaceId?: string) => {
    try {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl && spaceId) {
        console.log("🖼️ URL de l'image après upload:", imageUrl);
        
        // Mettre à jour l'espace avec la nouvelle image
        const { data, error } = await supabase
          .from('spaces')
          .update({ image_url: imageUrl })
          .eq('id', spaceId)
          .select();

        if (error) {
          console.error("❌ Erreur lors de la mise à jour de l'espace:", error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour l'image de l'espace",
            variant: "destructive",
          });
          return null;
        }

        console.log("✅ Espace mis à jour avec succès:", data);
        loadOwnedSpaces(); // Recharger les espaces pour afficher la nouvelle image
        
        toast({
          title: "Succès",
          description: "L'image de l'espace a été mise à jour",
        });
      }
      return imageUrl;
    } catch (error) {
      console.error("❌ Erreur lors de l'upload de l'image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    setOwnedSpaces,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload: handleSpaceImageUpload,
    loadOwnedSpaces,
    checkSpaceOverlap,
    isLoading
  };
};