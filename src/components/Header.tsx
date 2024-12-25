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
        <header className="flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <InfoDialog />
          </div>
          <h1 className="retro-title rainbow-title mb-0 flex-1 animate-bounce whitespace-nowrap text-2xl md:text-6xl text-left md:text-center">HALL OF MEME</h1>
          <div className="flex-1 flex justify-end">
            <Button
              onClick={onConnectWallet}
              className={`retro-button px-1 md:px-6 ${connected ? 'border-2 border-accent animate-glow' : ''}`}
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