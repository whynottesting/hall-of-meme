import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { createSolanaTransaction } from '@/utils/solana';

export const useSpaces = () => {
  const { selectedSpace, handleSpaceSelection, handleInputChange } = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOwnedSpaces();
  }, []);

  const processSpacePurchase = async (walletAddress: string, imageUrl: string) => {
    setIsProcessing(true);
    try {
      // Vérifier si l'espace existe déjà
      const { data: existingSpaces } = await supabase
        .from('spaces')
        .select('*')
        .eq('x', selectedSpace.x)
        .eq('y', selectedSpace.y)
        .single();

      if (existingSpaces) {
        throw new Error('Cet espace est déjà pris');
      }

      // Vérifier la disponibilité de l'espace
      const { data, error } = await supabase.functions.invoke('process-space-purchase', {
        body: {
          x: selectedSpace.x,
          y: selectedSpace.y,
          width: selectedSpace.width,
          height: selectedSpace.height,
          walletAddress
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      // Calculer le prix en lamports
      const price = selectedSpace.width * selectedSpace.height * 100 * 0.01;
      const lamports = Math.floor(price * data.lamportsPerSol);

      const signature = await createSolanaTransaction(
        // @ts-ignore
        window.phantom?.solana,
        data.ownerWallet,
        lamports
      );

      console.log('Saving space to database with image URL:', imageUrl);

      // Sauvegarder l'espace dans la base de données
      const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .insert([{
          wallet_address: walletAddress,
          x: selectedSpace.x,
          y: selectedSpace.y,
          width: selectedSpace.width,
          height: selectedSpace.height,
          url: selectedSpace.link,
          image_url: imageUrl,
          price: price
        }])
        .select()
        .single();

      if (spaceError) {
        console.error('Error saving space:', spaceError);
        throw spaceError;
      }

      console.log('Space saved successfully:', space);

      // Enregistrer la transaction
      await supabase
        .from('transaction_history')
        .insert([{
          wallet_address: walletAddress,
          space_id: space.id,
          status: 'completed',
        }]);

      toast({
        title: "Espace Sécurisé !",
        description: "Votre espace a été acheté avec succès",
      });

      await loadOwnedSpaces();
    } catch (error: any) {
      console.error('Error processing space purchase:', error);
      
      toast({
        title: "Transaction Échouée",
        description: error.message || "Impossible de sécuriser votre espace",
        variant: "destructive",
      });

      // Enregistrer l'erreur dans l'historique des transactions
      await supabase
        .from('transaction_history')
        .insert([{
          wallet_address: walletAddress,
          status: 'failed',
          error_message: error.message
        }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadOwnedSpaces = async () => {
    setIsLoading(true);
    try {
      console.log('Loading owned spaces...');
      const { data, error } = await supabase
        .from('spaces')
        .select('*');
      
      if (error) {
        console.error('Error fetching spaces:', error);
        throw error;
      }
      
      console.log('Raw spaces data from Supabase:', data);
      
      if (!data || data.length === 0) {
        console.log('No spaces found in database');
        setOwnedSpaces([]);
        return;
      }
      
      const formattedSpaces = data.map(space => {
        console.log('Formatting space:', space);
        return {
          x: space.x,
          y: space.y,
          width: space.width,
          height: space.height,
          image: space.image_url,
          link: space.url
        };
      });
      
      console.log('Formatted spaces for PixelGrid:', formattedSpaces);
      setOwnedSpaces(formattedSpaces);
    } catch (error) {
      console.error('Error loading spaces:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les espaces existants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedSpace,
    ownedSpaces,
    isProcessing,
    isLoading,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload,
    processSpacePurchase,
    loadOwnedSpaces,
  };
};