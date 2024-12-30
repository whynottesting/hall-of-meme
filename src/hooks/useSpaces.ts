import { useCallback, useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { Space } from '@/utils/solana/types';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const loadOwnedSpaces = useCallback(async () => {
    try {
      console.log("♻️ Rechargement manuel des espaces...");
      const { data: updatedSpaces, error } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Erreur lors du rechargement des espaces:", error);
        throw error;
      }

      if (updatedSpaces) {
        console.log("✅ Espaces rechargés avec succès:", updatedSpaces);
        setOwnedSpaces(updatedSpaces);
      }
    } catch (error) {
      console.error("❌ Erreur lors du rechargement des espaces:", error);
      toast({
        title: "Erreur",
        description: "Impossible de recharger les espaces",
        variant: "destructive",
      });
    }
  }, []);

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

  const handleSpaceImageUpload = async (file: File) => {
    try {
      console.log("📤 Upload de l'image en cours...");
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        console.log("🖼️ URL de l'image après upload:", imageUrl);
        spaceSelection.handleInputChange('imageUrl', imageUrl);
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