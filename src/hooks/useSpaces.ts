import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Space {
  x: number;
  y: number;
  width: number;
  height: number;
  link: string;
}

export const useSpaces = () => {
  const [selectedSpace, setSelectedSpace] = useState<Space>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    link: '',
  });
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([]);

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

  return {
    selectedSpace,
    ownedSpaces,
    handleSpaceSelection,
    handleInputChange,
    handleImageUpload,
    loadOwnedSpaces,
  };
};