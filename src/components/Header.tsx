import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import InfoDialog from "@/components/InfoDialog";

interface HeaderProps {
  connected: boolean;
  onConnectWallet: () => void;
}

const Header = ({ connected, onConnectWallet }: HeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-primary">
      <div className="retro-container py-4">
        <header className="flex justify-between items-center relative">
          <div className="flex items-center gap-2 md:absolute md:left-0">
            <InfoDialog />
            <h1 className="retro-title rainbow-title mb-0 whitespace-nowrap text-2xl md:text-6xl text-left md:text-center">HALL OF MEME</h1>
          </div>
          <div className="hidden md:block mx-auto">
            <h1 className="retro-title rainbow-title mb-0 whitespace-nowrap text-6xl">HALL OF MEME</h1>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onConnectWallet}
              className={`retro-button ${connected ? 'border-2 border-accent animate-glow' : ''}`}
            >
              {connected ? "Wallet Connected" : isMobile ? "Connect Wallet" : "Connect Phantom Wallet"}
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;