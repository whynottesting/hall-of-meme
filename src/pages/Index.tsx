import React, { useEffect, useState } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import Header from '@/components/Header';
import { usePhantomWallet } from '@/hooks/usePhantomWallet';
import { useSpaces } from '@/hooks/useSpaces';
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const Index = () => {
  const { connected, handleConnectWallet, publicKey, phantomWallet } = usePhantomWallet();
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

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadOwnedSpaces();
  }, []);

  const handleSubmit = async () => {
    if (!connected || !publicKey || !phantomWallet) {
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

    await processSpacePurchase(phantomWallet, publicKey, imageUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header connected={connected} onConnectWallet={handleConnectWallet} />

      <div className="retro-container pt-32">
        <p className="retro-subtitle text-center">Your Meme, Your Space, Your Legacy</p>
        
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)}
            className="text-primary text-xl md:text-2xl font-bold underline hover:text-accent transition-colors duration-200 mx-auto block mt-4 animate-blink"
          >
            Claim Your Space Before It's Gone!
          </button>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Fermer le formulaire"
            >
              <X className="h-4 w-4" />
            </button>
            <SpaceForm
              {...selectedSpace}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onSubmit={handleSubmit}
              price={selectedSpace.width * selectedSpace.height * 0.01}
              isProcessing={isProcessing}
            />
          </div>
        )}

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