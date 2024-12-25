import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';

export const useSpaces = () => {
  const { selectedSpace, handleSpaceSelection, handleInputChange } = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadOwnedSpaces = async () => {
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
  };

  useEffect(() => {
    loadOwnedSpaces();
  }, []);

  const processSpacePurchase = async (walletAddress: string, imageUrl: string) => {
    setIsProcessing(true);
    try {
      if (!selectedSpace) throw new Error("Aucun espace sélectionné");

      const price = selectedSpace.width * selectedSpace.height * 0.01;

      const response = await fetch('/api/process-space-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          x: selectedSpace.x,
          y: selectedSpace.y,
          width: selectedSpace.width,
          height: selectedSpace.height,
          link: selectedSpace.link,
          imageUrl,
          price
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la réservation de l'espace");
      }

      await loadOwnedSpaces();
      toast({
        title: "Succès",
        description: "Votre espace a été réservé avec succès!",
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
  };

  return {
    selectedSpace,
    ownedSpaces,
    isProcessing,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload,
    processSpacePurchase,
    loadOwnedSpaces
  };
};