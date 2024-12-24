import React, { useEffect } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import Header from '@/components/Header';
import { usePhantomWallet } from '@/hooks/usePhantomWallet';
import { useSpaces } from '@/hooks/useSpaces';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { connected, phantomWallet, handleConnectWallet } = usePhantomWallet();
  const {
    selectedSpace,
    ownedSpaces,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload,
    loadOwnedSpaces
  } = useSpaces();

  useEffect(() => {
    loadOwnedSpaces();
  }, []);

  const handleSubmit = async () => {
    if (!connected) {
      toast({
        title: "Wallet Non Connecté",
        description: "Veuillez d'abord connecter votre Phantom wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const publicKey = phantomWallet.publicKey.toString();
      const price = selectedSpace.width * selectedSpace.height * 0.01;

      const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .insert([{
          wallet_address: publicKey,
          x: selectedSpace.x,
          y: selectedSpace.y,
          width: selectedSpace.width,
          height: selectedSpace.height,
          url: selectedSpace.link,
          price: price,
        }])
        .select()
        .single();

      if (spaceError) throw spaceError;

      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert([{
          wallet_address: publicKey,
          space_id: space.id,
          status: 'completed',
        }]);

      if (transactionError) throw transactionError;

      toast({
        title: "Espace Sécurisé !",
        description: "Votre espace a été acheté avec succès",
      });

      loadOwnedSpaces();

    } catch (error: any) {
      console.error('Error securing space:', error);
      
      if (error.space_id) {
        await supabase
          .from('transaction_history')
          .insert([{
            wallet_address: phantomWallet.publicKey.toString(),
            space_id: error.space_id,
            status: 'failed',
            error_message: error.message
          }]);
      }

      toast({
        title: "Transaction Échouée",
        description: "Impossible de sécuriser votre espace",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header connected={connected} onConnectWallet={handleConnectWallet} />

      <div className="retro-container pt-32">
        <p className="retro-subtitle text-center">Your Meme, Your Space, Your Legacy</p>

        <SpaceForm
          {...selectedSpace}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmit}
          price={selectedSpace.width * selectedSpace.height * 0.01}
        />

        <div className="mt-4 mb-4">
          <SolPrice />
        </div>

        <div className="mt-4">
          <PixelGrid
            selectedCells={selectedSpace}
            ownedCells={ownedSpaces}
            onCellClick={handleSpaceSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;