import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';

const OWNER_WALLET = 'DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs';

export const useSpaces = () => {
  const spaceSelection = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      const xOverlap = (
        (newSpace.x >= existingSpace.x && newSpace.x < existingSpace.x + existingSpace.width) ||
        (existingSpace.x >= newSpace.x && existingSpace.x < newSpace.x + newSpace.width)
      );
      
      const yOverlap = (
        (newSpace.y >= existingSpace.y && newSpace.y < existingSpace.y + existingSpace.height) ||
        (existingSpace.y >= newSpace.y && existingSpace.y < newSpace.y + newSpace.height)
      );

      return xOverlap && yOverlap;
    });
  }, [ownedSpaces]);

  const processSpacePurchase = useCallback(async (phantomWallet: any, walletAddress: string, imageUrl: string) => {
    setIsProcessing(true);
    try {
      if (!spaceSelection.selectedSpace) throw new Error("Aucun espace sélectionné");

      if (checkSpaceOverlap(spaceSelection.selectedSpace)) {
        throw new Error("Cet espace chevauche un espace déjà réservé");
      }

      // Temporarily disabled Solana transaction
      toast({
        title: "Information",
        description: "La fonctionnalité de paiement est temporairement désactivée",
        variant: "default",
      });

    } catch (error: any) {
      console.error('Error processing space purchase:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'achat",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [spaceSelection.selectedSpace, checkSpaceOverlap]);

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    isProcessing,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload,
    processSpacePurchase,
    loadOwnedSpaces
  };
};