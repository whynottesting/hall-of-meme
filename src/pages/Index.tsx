import React, { useState } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import Header from '@/components/Header';
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useSpaces } from '@/hooks/useSpaces';
import { usePhantomWallet } from '@/hooks/usePhantomWallet';
import { useSpacePurchase } from '@/hooks/useSpacePurchase';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const { walletAddress, isConnected, provider } = usePhantomWallet();
  const { purchaseSpace, isProcessing } = useSpacePurchase();
  const { 
    selectedSpace,
    ownedSpaces,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload
  } = useSpaces();

  const handlePurchase = async () => {
    console.log('🚀 Starting purchase process...');
    console.log('👛 Wallet status:', { 
      isConnected, 
      walletAddress,
      hasProvider: !!provider
    });

    if (!isConnected || !provider) {
      console.log('❌ Purchase failed: Wallet not connected or provider missing');
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Wallet connected, proceeding with purchase...');
    console.log('📦 Selected space data:', selectedSpace);

    const success = await purchaseSpace(provider, {
      x: selectedSpace.x,
      y: selectedSpace.y,
      width: selectedSpace.width,
      height: selectedSpace.height,
      walletAddress: walletAddress!,
      imageUrl: selectedSpace.image_url || '',
      link: selectedSpace.link,
      price: selectedSpace.width * selectedSpace.height * 100 * 0.01
    });

    if (success) {
      console.log('✅ Purchase completed successfully');
      setShowForm(false);
    } else {
      console.log('❌ Purchase failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="retro-container pt-32">
        <div className="max-w-4xl mx-auto">
          <p className="retro-subtitle mb-0 text-center">Your Meme, Your Space, Your Legacy</p>
        </div>
        
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)}
            className="text-primary text-xl md:text-2xl font-bold underline hover:text-accent transition-colors duration-200 mx-auto block mt-8 mb-8 animate-blink"
          >
            Claim Your Space Before It's Gone!
          </button>
        ) : (
          <div className="relative mt-8 mb-8">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Fermer le formulaire"
            >
              <X className="h-4 w-4" />
            </button>
            <SpaceForm
              x={selectedSpace.x}
              y={selectedSpace.y}
              width={selectedSpace.width}
              height={selectedSpace.height}
              link={selectedSpace.link}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onSubmit={handlePurchase}
              price={selectedSpace.width * selectedSpace.height * 100 * 0.01}
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

        <footer className="text-center text-xs text-gray-500 mt-8 mb-4">
          Hall of Meme © 2025. All rights reserved. I am not responsible for the content of external sites. Images featured on homepage are © of their respective owners.
        </footer>
      </div>
    </div>
  );
};

export default Index;
