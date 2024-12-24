import React, { useEffect } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import Header from '@/components/Header';
import { usePhantomWallet } from '@/hooks/usePhantomWallet';
import { useSpaces } from '@/hooks/useSpaces';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { connected, phantomWallet, handleConnectWallet } = usePhantomWallet();
  const {
    selectedSpace,
    ownedSpaces,
    isProcessing,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload,
    processSpacePurchase,
    loadOwnedSpaces
  } = useSpaces();

  useEffect(() => {
    loadOwnedSpaces();
  }, []);

  const handleSubmit = async () => {
    if (!connected || !phantomWallet) {
      toast({
        title: "Wallet Non Connecté",
        description: "Veuillez d'abord connecter votre Phantom wallet",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSpace.link) {
      toast({
        title: "Lien Manquant",
        description: "Veuillez fournir un lien URL pour votre espace",
        variant: "destructive",
      });
      return;
    }

    const imageInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!imageInput?.files?.[0]) {
      toast({
        title: "Image Manquante",
        description: "Veuillez sélectionner une image pour votre espace",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = await handleImageUpload(imageInput.files[0]);
    if (!imageUrl) return;

    await processSpacePurchase(phantomWallet.publicKey.toString(), imageUrl);
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
          isProcessing={isProcessing}
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