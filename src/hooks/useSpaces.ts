import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Space {
  x: number;
  y: number;
  width: number;
  height: number;
  link: string;
}

export const useSpaces = () => {
  const [selectedSpace, setSelectedSpace] = useState<Space>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    link: '',
  });
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSpaceSelection = (x: number, y: number) => {
    setSelectedSpace(prev => ({
      ...prev,
      x,
      y,
    }));
  };

  const handleInputChange = (field: string, value: number | string) => {
    setSelectedSpace(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('space-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('space-images')
        .getPublicUrl(fileName);

      toast({
        title: "Image Téléchargée",
        description: "Votre image a été téléchargée avec succès",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
      return null;
    }
  };

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

      // Calculer le prix en lamports
      const price = selectedSpace.width * selectedSpace.height * 0.01;
      const lamports = Math.floor(price * data.lamportsPerSol);

      // @ts-ignore
      const transaction = await window.phantom?.solana.connect();
      
      // @ts-ignore
      const provider = window.phantom?.solana;
      
      if (!provider) throw new Error("Phantom wallet not found");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: new PublicKey(data.ownerWallet),
          lamports: lamports
        })
      );

      const { signature } = await provider.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature);

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