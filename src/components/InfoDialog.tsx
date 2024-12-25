import React from 'react';
import { Info, X } from "lucide-react";
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
        <div className="mt-4 space-y-4">
          <p>
            Bienvenue dans le Hall of Meme, un espace unique où chaque pixel raconte une histoire !
          </p>
          <p>
            Ici, vous pouvez acquérir votre propre espace sur notre grille et y afficher le meme de votre choix. 
            Chaque espace est unique et vous appartient, vous permettant de partager votre créativité avec le monde.
          </p>
          <p>
            Pour commencer :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Connectez votre wallet Phantom</li>
            <li>Sélectionnez un espace sur la grille</li>
            <li>Uploadez votre image</li>
            <li>Ajoutez un lien (optionnel)</li>
            <li>Confirmez votre achat</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Prix : 0.01 SOL par pixel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;