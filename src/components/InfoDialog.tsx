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
            <p>By purchasing an area on the grid. The larger your space, the bigger your airdrop reward. Additionally, if your wallet is connected and you share the page on X/Twitter, we'll track it—and that will also make you eligible for the airdrop.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;