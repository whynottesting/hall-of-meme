import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import InfoDialog from "@/components/InfoDialog";
import { Wallet } from "lucide-react";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";

const Header = () => {
  const isMobile = useIsMobile();
  const { publicKey, connect, disconnect, isConnected } = usePhantomWallet();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const getButtonText = () => {
    if (!isConnected) {
      return isMobile ? "Connect" : "Connect Phantom Wallet";
    }
    return `Connected: ${publicKey?.slice(0, 4)}...`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-primary">
      <div className="retro-container py-4">
        <header className="flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <InfoDialog />
          </div>
          <h1 className="retro-title rainbow-title mb-0 flex-1 animate-bounce whitespace-nowrap text-2xl md:text-6xl text-left md:text-center">HALL OF MEME</h1>
          <div className="flex-1 flex justify-end items-center gap-4">
            <Button
              className="retro-button px-1 md:px-6 flex items-center gap-2"
              onClick={handleWalletAction}
            >
              <Wallet className="h-4 w-4" />
              {getButtonText()}
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;