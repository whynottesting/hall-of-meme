import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { createSolanaTransaction } from '@/utils/solana/transaction-utils';

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

      const price = spaceSelection.selectedSpace.width * 
                   spaceSelection.selectedSpace.height * 
                   100 * 0.01;
      const lamports = Math.floor(price * 1000000000); // Convert SOL to lamports

      console.log("💰 Prix calculé:", price, "SOL");
      console.log("💸 Montant en lamports:", lamports);

      // Créer et envoyer la transaction
      const signature = await createSolanaTransaction(
        phantomWallet,
        OWNER_WALLET,
        lamports
      );

      console.log("✅ Transaction réussie! Signature:", signature);

      // Enregistrer l'espace dans la base de données
      const { error: insertError } = await supabase
        .from('spaces')
        .insert({
          wallet_address: walletAddress,
          x: spaceSelection.selectedSpace.x,
          y: spaceSelection.selectedSpace.y,
          width: spaceSelection.selectedSpace.width,
          height: spaceSelection.selectedSpace.height,
          url: spaceSelection.selectedSpace.link,
          image_url: imageUrl,
          price: price
        });

      if (insertError) throw insertError;

      // Enregistrer la transaction
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          wallet_address: walletAddress,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Succès!",
        description: "Votre espace a été réservé avec succès",
      });

      // Recharger les espaces
      await loadOwnedSpaces();

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
  }, [spaceSelection.selectedSpace, checkSpaceOverlap, loadOwnedSpaces]);

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