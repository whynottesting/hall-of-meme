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
    toast({
      title: "Image Uploaded",
      description: "Your image has been successfully uploaded",
    });
  };

  const calculatePrice = () => {
    return selectedSpace.width * selectedSpace.height * 100 * 0.01;
  };

  const handleSubmit = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Phantom wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
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
      <div className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-primary">
        <div className="retro-container py-4">
          <header className="flex justify-between items-center">
            <div className="flex-1"></div>
            <h1 className="retro-title mb-0 flex-1 text-center">HALL OF MEME</h1>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleConnectWallet}
                className="retro-button"
              >
                {connected ? "Wallet Connected" : "Connect Phantom Wallet"}
              </Button>
            </div>
          </header>
        </div>
      </div>

      <div className="retro-container pt-32">
        <p className="retro-subtitle text-center">Your Meme, Your Space, Your Legacy</p>

        <SpaceForm
          {...selectedSpace}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmit}
          price={calculatePrice()}
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