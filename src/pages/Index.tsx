import React, { useState, useEffect } from 'react';
import PixelGrid from '@/components/PixelGrid';
import SpaceForm from '@/components/SpaceForm';
import SolPrice from '@/components/SolPrice';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [connected, setConnected] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    link: '',
  });
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);
  const [phantomWallet, setPhantomWallet] = useState<any>(null);

  useEffect(() => {
    const checkPhantomWallet = async () => {
      try {
        // @ts-ignore
        const phantom = window.phantom?.solana;
        
        if (phantom?.isPhantom) {
          setPhantomWallet(phantom);
          console.log("Phantom wallet detected!");
        } else {
          toast({
            title: "Phantom Wallet Non Trouvé",
            description: "Veuillez installer Phantom Wallet pour continuer",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error detecting Phantom wallet:", error);
      }
    };

    const loadOwnedSpaces = async () => {
      try {
        const { data, error } = await supabase
          .from('spaces')
          .select('*');
        
        if (error) throw error;
        
        setOwnedSpaces(data.map(space => ({
          x: space.x,
          y: space.y,
          width: space.width,
          height: space.height,
          image: space.image_url,
          link: space.url
        })));
      } catch (error) {
        console.error('Error loading spaces:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les espaces existants",
          variant: "destructive",
        });
      }
    };

    checkPhantomWallet();
    loadOwnedSpaces();
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (!phantomWallet) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const { publicKey } = await phantomWallet.connect();
      if (publicKey) {
        setConnected(true);
        console.log("Connected with public key:", publicKey.toString());
        toast({
          title: "Wallet Connecté",
          description: "Connecté avec succès à Phantom wallet",
        });
      }
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      toast({
        title: "Échec de la Connexion",
        description: "Impossible de se connecter à Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const handleSpaceSelection = (x: number, y: number) => {
    setSelectedSpace(prev => ({
      ...prev,
      x,
      y,
    }));
  };

  const handleInputChange = (field: string, value: number | string) => {
    setSelectedSpace(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('space-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('space-images')
        .getPublicUrl(fileName);

      toast({
        title: "Image Téléchargée",
        description: "Votre image a été téléchargée avec succès",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!connected) {
      toast({
        title: "Wallet Non Connecté",
        description: "Veuillez d'abord connecter votre Phantom wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const publicKey = phantomWallet.publicKey.toString();
      const price = selectedSpace.width * selectedSpace.height * 0.01;

      // Insert into spaces table
      const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .insert([{
          wallet_address: publicKey,
          x: selectedSpace.x,
          y: selectedSpace.y,
          width: selectedSpace.width,
          height: selectedSpace.height,
          url: selectedSpace.link,
          price: price,
        }])
        .select()
        .single();

      if (spaceError) throw spaceError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert([{
          wallet_address: publicKey,
          space_id: space.id,
          status: 'completed',
        }]);

      if (transactionError) throw transactionError;

      toast({
        title: "Espace Sécurisé !",
        description: "Votre espace a été acheté avec succès",
      });

      // Refresh the owned spaces
      const { data: updatedSpaces } = await supabase
        .from('spaces')
        .select('*');
      
      setOwnedSpaces(updatedSpaces?.map(space => ({
        x: space.x,
        y: space.y,
        width: space.width,
        height: space.height,
        image: space.image_url,
        link: space.url
      })) || []);

    } catch (error: any) {
      console.error('Error securing space:', error);
      
      // Record the failed transaction if we have a space ID
      if (error.space_id) {
        await supabase
          .from('transaction_history')
          .insert([{
            wallet_address: phantomWallet.publicKey.toString(),
            space_id: error.space_id,
            status: 'failed',
            error_message: error.message
          }]);
      }

      toast({
        title: "Transaction Échouée",
        description: "Impossible de sécuriser votre espace",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-primary">
        <div className="retro-container py-4">
          <header className="flex justify-between items-center">
            <div className="flex-1"></div>
            <h1 className="retro-title mb-0 flex-1 text-center">HALL OF MEME</h1>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleConnectWallet}
                className="retro-button"
              >
                {connected ? "Wallet Connecté" : "Connecter Phantom Wallet"}
              </Button>
            </div>
          </header>
        </div>
      </div>

      <div className="retro-container pt-32">
        <p className="retro-subtitle text-center">Your Meme, Your Space, Your Legacy</p>

        <SpaceForm
          {...selectedSpace}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmit}
          price={selectedSpace.width * selectedSpace.height * 0.01}
        />

        <div className="mt-4 mb-4">
          <SolPrice />
        </div>

        <div className="mt-4">
          <PixelGrid
            selectedCells={selectedSpace}
            ownedCells={ownedSpaces}
            onCellClick={handleSpaceSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;