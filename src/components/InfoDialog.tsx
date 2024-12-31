import React from 'react';
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const InfoDialog = () => {
  const handleShareOnX = () => {
    const text = "🚨 Don't miss out! Secure your space on Hall Of Meme now and be eligible for the upcoming airdrop! 🎯\n\nhttps://hallofme.me";
    const encodedText = encodeURIComponent(text);
    window.open(`https://x.com/intent/tweet?text=${encodedText}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center w-8 h-8 hover:bg-accent hover:text-primary transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-retro">
        <DialogHeader>
          <DialogTitle className="text-2xl font-pixel text-center">Hall of Meme</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold">1. Will there be a token?</h3>
            <p>Yes.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">2. Will there be an airdrop?</h3>
            <p>Yes.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">3. How can I benefit from the airdrop?</h3>
            <p>
              By purchasing an area on the grid. The larger your space, the bigger your airdrop reward. Additionally, if you{" "}
              <button 
                onClick={handleShareOnX}
                className="text-accent hover:underline cursor-pointer"
              >
                share the page on X
              </button>
              {" "}when your wallet is connected, it will make your wallet eligible for the airdrop too.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">4. Three hidden surprises await!</h3>
            <p>Will you uncover the secret squares?</p>
          </div>

          <div className="text-center mt-6">
            <a 
              href="https://x.com/HallOfMe_me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              @HallOfMe_me
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;