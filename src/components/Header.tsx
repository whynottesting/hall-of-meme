import React from 'react';
import InfoDialog from "@/components/InfoDialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { Loader2 } from "lucide-react";

const Header = () => {
  const isMobile = useIsMobile();
  const { 
    publicKey, 
    isConnecting, 
    connectWallet, 
    disconnectWallet 
  } = usePhantomWallet();

  const handleWalletAction = () => {
    if (publicKey) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const getButtonText = () => {
    if (isConnecting) return isMobile ? "Connecting..." : "Connecting to Phantom Wallet...";
    if (publicKey) return isMobile ? `${publicKey.slice(0, 3)}...` : `Connected (${publicKey.slice(0, 3)}...)`;
    return isMobile ? "Connect" : "Connect Phantom Wallet";
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-primary">
      <div className="retro-container py-4">
        <header className="flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <InfoDialog />
          </div>
          <h1 className="retro-title rainbow-title mb-0 flex-1 animate-bounce whitespace-nowrap text-2xl md:text-6xl text-left md:text-center">HALL OF MEME</h1>
          <div className="flex-1 flex justify-end">
            <Button 
              className="font-retro bg-black text-white hover:bg-gray-800 hover:text-accent hover:border-2 hover:border-black transition-all duration-200"
              onClick={handleWalletAction}
              disabled={isConnecting}
            >
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;