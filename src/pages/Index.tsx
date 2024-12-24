import React, { useState } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [connected, setConnected] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    link: '',
  });
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);

  const handleConnectWallet = async () => {
    try {
      // Phantom wallet connection logic will go here
      setConnected(true);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Phantom wallet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

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

  const handleImageUpload = (file: File) => {
    // Image upload logic will go here
    toast({
      title: "Image Uploaded",
      description: "Your image has been successfully uploaded",
    });
  };

  const calculatePrice = () => {
    return selectedSpace.width * selectedSpace.height * 100 * 0.01;
  };

  const handleSubmit = async () => {
    try {
      // Transaction logic will go here
      toast({
        title: "Space Secured!",
        description: "Your space has been successfully purchased",
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to secure your space",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="retro-container py-8">
        <header className="text-center mb-8">
          <h1 className="retro-title">HALL OF MEME</h1>
          <p className="retro-subtitle">Your Meme, Your Space, Your Legacy</p>
          {!connected && (
            <Button
              onClick={handleConnectWallet}
              className="retro-button"
            >
              Connect Phantom Wallet
            </Button>
          )}
        </header>

        <SolPrice />

        <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
          <PixelGrid
            selectedCells={selectedSpace}
            ownedCells={ownedSpaces}
            onCellClick={handleSpaceSelection}
          />
          
          {connected && (
            <SpaceForm
              {...selectedSpace}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onSubmit={handleSubmit}
              price={calculatePrice()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;