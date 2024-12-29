import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';

export const useSpaces = () => {
  const spaceSelection = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);

  const loadOwnedSpaces = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*');

      if (error) throw error;

      const formattedSpaces = data.map(space => ({
        x: space.x,
        y: space.y,
        width: space.width,
        height: space.height,
        image: space.image_url,
        link: space.url
      }));

      setOwnedSpaces(formattedSpaces);
    } catch (error) {
      console.error('Error loading spaces:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les espaces",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    loadOwnedSpaces();
  }, [loadOwnedSpaces]);

  const checkSpaceOverlap = useCallback((newSpace: any) => {
    return ownedSpaces.some(existingSpace => {
      // Vérifie si le nouvel espace chevauche un espace existant
      const newSpaceRight = newSpace.x + newSpace.width;
      const newSpaceBottom = newSpace.y + newSpace.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      // Un chevauchement existe si les rectangles se superposent sur les deux axes
      return !(
        newSpace.x >= existingSpaceRight || // Nouveau à droite de l'existant
        newSpaceRight <= existingSpace.x || // Nouveau à gauche de l'existant
        newSpace.y >= existingSpaceBottom || // Nouveau en dessous de l'existant
        newSpaceBottom <= existingSpace.y    // Nouveau au-dessus de l'existant
      );
    });
  }, [ownedSpaces]);

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload,
    loadOwnedSpaces,
    checkSpaceOverlap
  };
};