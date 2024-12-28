import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createSolanaTransaction } from "@/utils/solana/transaction-utils";

interface SpacePurchaseData {
  x: number;
  y: number;
  width: number;
  height: number;
  walletAddress: string;
  imageUrl: string;
  link: string;
  price: number;
}

export const useSpacePurchase = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseSpace = async (provider: any, data: SpacePurchaseData) => {
    try {
      setIsProcessing(true);
      console.log('Starting space purchase:', data);

      // Create and send transaction
      const signature = await createSolanaTransaction(
        provider,
        'DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs',
        data.price * 1000000000 // Convert SOL to lamports
      );

      console.log('Transaction signature:', signature);

      // Confirm transaction and save space data
      const { data: confirmationData, error: confirmationError } = await supabase.functions.invoke(
        'confirm-transaction',
        {
          body: {
            signature,
            spaceData: data
          }
        }
      );

      if (confirmationError) {
        throw new Error(confirmationError.message);
      }

      console.log('Space purchase confirmed:', confirmationData);
      
      toast({
        title: "Purchase Successful",
        description: "Your space has been secured successfully!",
      });

      return true;
    } catch (error: any) {
      console.error('Error purchasing space:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase space. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    purchaseSpace,
    isProcessing
  };
};