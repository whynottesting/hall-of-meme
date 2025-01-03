import { useCallback, useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { Space } from '@/utils/solana/types';

export const useSpaces = () => {
  const [ownedSpaces, setOwnedSpaces] = useState<Space[]>([]);
  const spaceSelection = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const { data: spaces, isLoading } = useSupabaseQuery('spaces');

  useEffect(() => {
    console.log("🔄 Chargement initial des espaces:", spaces);
    if (spaces) {
      setOwnedSpaces(spaces);
    }
  }, [spaces]);

  const loadOwnedSpaces = useCallback(() => {
    if (spaces) {
      console.log("♻️ Rechargement manuel des espaces:", spaces);
      setOwnedSpaces(spaces);
    }
  }, [spaces]);

  const checkSpaceOverlap = useCallback((newSpace: Space) => {
    return ownedSpaces.some(existingSpace => {
      const newSpaceRight = newSpace.x + newSpace.width;
      const newSpaceBottom = newSpace.y + newSpace.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      const xOverlap = newSpace.x < existingSpaceRight && newSpaceRight > existingSpace.x;
      const yOverlap = newSpace.y < existingSpaceBottom && newSpaceBottom > existingSpace.y;

      return xOverlap && yOverlap;
    });
  }, [ownedSpaces]);

  const handleSpaceImageUpload = async (file: File) => {
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      console.log("🖼️ URL de l'image après upload:", imageUrl);
      spaceSelection.handleInputChange('imageUrl', imageUrl);
    }
    return imageUrl;
  };

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    setOwnedSpaces,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload: handleSpaceImageUpload,
    loadOwnedSpaces,
    checkSpaceOverlap,
    isLoading
  };
};