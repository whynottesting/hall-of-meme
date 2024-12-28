import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import InfoDialog from "@/components/InfoDialog";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { Loader2, Wallet } from "lucide-react";

const Header = () => {
  const isMobile = useIsMobile();
  const { walletAddress, isConnecting, connectWallet, disconnectWallet } = usePhantomWallet();

  const getButtonText = () => {
    if (isConnecting) return "Connexion...";
    if (walletAddress) return `Connecté: ${walletAddress.slice(0, 4)}...`;
    return isMobile ? "Connecter" : "Connecter Phantom Wallet";
  };

  const handleWalletAction = () => {
    if (walletAddress) {
      disconnectWallet();
    } else {
      connectWallet();
    }
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
              onClick={handleWalletAction}
              className="retro-button px-1 md:px-6 flex items-center gap-2"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {getButtonText()}
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;