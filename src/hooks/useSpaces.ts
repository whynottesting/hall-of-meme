import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { Transaction } from '@solana/web3.js';

const OWNER_WALLET = 'DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs';

export const useSpaces = () => {
  const spaceSelection = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

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

  const handleImageUploadWrapper = async (file: File) => {
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setUploadedImageUrl(imageUrl);
    }
    return imageUrl;
  };

  const processSpacePurchase = useCallback(async (phantomWallet: any, walletAddress: string) => {
    setIsProcessing(true);
    try {
      if (!spaceSelection.selectedSpace) throw new Error("Aucun espace sélectionné");
      if (!uploadedImageUrl) throw new Error("Veuillez uploader une image");
      if (!spaceSelection.selectedSpace.link) throw new Error("Veuillez fournir un lien");

      if (checkSpaceOverlap(spaceSelection.selectedSpace)) {
        throw new Error("Cet espace chevauche un espace déjà réservé");
      }

      // Créer la transaction via l'Edge Function
      const { data, error } = await supabase.functions.invoke('process-space-purchase', {
        body: {
          x: spaceSelection.selectedSpace.x,
          y: spaceSelection.selectedSpace.y,
          width: spaceSelection.selectedSpace.width,
          height: spaceSelection.selectedSpace.height,
          walletAddress,
          imageUrl: uploadedImageUrl,
          link: spaceSelection.selectedSpace.link,
          price: spaceSelection.selectedSpace.width * spaceSelection.selectedSpace.height * 100 * 0.01
        }
      });

      if (error) throw error;

      // Décoder et signer la transaction
      const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));
      const signedTransaction = await phantomWallet.signTransaction(transaction);

      // Envoyer la transaction signée
      const { data: confirmData } = await supabase.functions.invoke('confirm-transaction', {
        body: { 
          signedTransaction: Buffer.from(signedTransaction.serialize()).toString('base64')
        }
      });

      if (confirmData.error) throw new Error(confirmData.error);

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
          image_url: uploadedImageUrl,
          price: spaceSelection.selectedSpace.width * spaceSelection.selectedSpace.height * 100 * 0.01
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Votre espace a été réservé avec succès!",
      });

      // Recharger les espaces
      loadOwnedSpaces();

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
  }, [spaceSelection.selectedSpace, checkSpaceOverlap, uploadedImageUrl, loadOwnedSpaces]);

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    isProcessing,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload: handleImageUploadWrapper,
    processSpacePurchase,
    loadOwnedSpaces
  };
};