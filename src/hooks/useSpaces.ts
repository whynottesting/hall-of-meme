import { useState } from 'react';
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

  const processSpacePurchase = async (walletAddress: string, imageUrl: string) => {
    setIsProcessing(true);
    try {
      // Vérifier la disponibilité de l'espace
      const response = await fetch('/functions/process-space-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: selectedSpace.x,
          y: selectedSpace.y,
          width: selectedSpace.width,
          height: selectedSpace.height,
          walletAddress
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Calculer le prix en lamports (100 pixels par case car 10x10)
      const price = selectedSpace.width * selectedSpace.height * 100 * 0.01;
      const lamports = Math.floor(price * data.lamportsPerSol);

      const signature = await createSolanaTransaction(
        // @ts-ignore
        window.phantom?.solana,
        data.ownerWallet,
        lamports
      );

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

      if (spaceError) throw spaceError;

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
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*');
      
      if (error) throw error;
      
      setOwnedSpaces(data.map(space => ({
        x: space.x,
        y: space.y,
        width: space.width,
        height: space.height,
        image: space.image_url,
        link: space.url
      })));
    } catch (error) {
      console.error('Error loading spaces:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les espaces existants",
        variant: "destructive",
      });
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
    loadOwnedSpaces,
  };
};