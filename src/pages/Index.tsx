import React, { useState } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import Header from '@/components/Header';
import { useSpaces } from '@/hooks/useSpaces';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const { 
    selectedSpace,
    ownedSpaces,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload
  } = useSpaces();

  const handlePurchase = async () => {
    console.log('🚀 Starting purchase process...');
    console.log('📦 Selected space data:', selectedSpace);
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
              className="absolute right-2 -top-1 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close form"
            >
              ✕
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
              isProcessing={false}
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