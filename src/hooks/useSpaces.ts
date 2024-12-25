import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { createSolanaTransaction } from '@/utils/solana';

const OWNER_WALLET = 'DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs';

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

  const checkSpaceOverlap = (newSpace: any) => {
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
  };

  const processSpacePurchase = async (phantomWallet: any, walletAddress: string, imageUrl: string) => {
    setIsProcessing(true);
    try {
      if (!selectedSpace) throw new Error("Aucun espace sélectionné");

      // Check for overlap before proceeding
      if (checkSpaceOverlap(selectedSpace)) {
        throw new Error("Cet espace chevauche un espace déjà réservé");
      }

      // Calculate price in SOL (each cell is 10x10 pixels, and each pixel costs 0.01 SOL)
      const price = selectedSpace.width * selectedSpace.height * 100 * 0.01;
      
      // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(price * 1000000000);

      try {
        // Process the Solana transaction
        const signature = await createSolanaTransaction(phantomWallet, OWNER_WALLET, lamports);
        console.log("Transaction signature:", signature);
      } catch (error: any) {
        console.error("Transaction error:", error);
        throw new Error("La transaction Solana a échoué. Vérifiez votre solde et réessayez.");
      }

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