import React from 'react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  connected: boolean;
  onConnectWallet: () => void;
}

const Header = ({ connected, onConnectWallet }: HeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-primary">
      <div className="retro-container py-4">
        <header className="flex justify-between items-center">
          <div className="flex-1"></div>
          <h1 className="retro-title mb-0 flex-1 text-center">HALL OF MEME</h1>
          <div className="flex-1 flex justify-end">
            <Button
              onClick={onConnectWallet}
              className="retro-button"
            >
              {connected ? "Wallet Connecté" : "Connecter Phantom Wallet"}
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;