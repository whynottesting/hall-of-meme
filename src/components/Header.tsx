import React from 'react';
import InfoDialog from "@/components/InfoDialog";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

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
              variant="outline"
              onClick={() => console.log('Connect wallet clicked')}
              className="font-retro"
            >
              {isMobile ? "Connect" : "Connect Phantom Wallet"}
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;