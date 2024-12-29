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
      // Vérifier si les rectangles se chevauchent en x
      const xOverlap = (
        newSpace.x < existingSpace.x + existingSpace.width &&
        newSpace.x + newSpace.width > existingSpace.x
      );
      
      // Vérifier si les rectangles se chevauchent en y
      const yOverlap = (
        newSpace.y < existingSpace.y + existingSpace.height &&
        newSpace.y + newSpace.height > existingSpace.y
      );

      // Il y a chevauchement uniquement si les deux conditions sont vraies
      return xOverlap && yOverlap;
    });
  }, [ownedSpaces]);

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload,
    loadOwnedSpaces
  };
};