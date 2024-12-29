import { useCallback, useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSpaceSelection } from './useSpaceSelection';
import { useImageUpload } from './useImageUpload';
import { Space } from '@/utils/solana/types';

export const useSpaces = () => {
  const [ownedSpaces, setOwnedSpaces] = useState<Space[]>([]);
  const spaceSelection = useSpaceSelection();
  const { handleImageUpload } = useImageUpload();
  const { data: spaces } = useSupabaseQuery('spaces');

  const loadOwnedSpaces = useCallback(() => {
    if (spaces) {
      setOwnedSpaces(spaces);
    }
  }, [spaces]);

  const checkSpaceOverlap = useCallback((newSpace: Space) => {
    return ownedSpaces.some(existingSpace => {
      // Vérifie si le nouvel espace chevauche un espace existant
      const newSpaceRight = newSpace.x + newSpace.width;
      const newSpaceBottom = newSpace.y + newSpace.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      // Un chevauchement existe si les rectangles se superposent sur les deux axes
      const xOverlap = newSpace.x < existingSpaceRight && newSpaceRight > existingSpace.x;
      const yOverlap = newSpace.y < existingSpaceBottom && newSpaceBottom > existingSpace.y;

      // Il y a chevauchement uniquement si les deux conditions sont vraies
      return xOverlap && yOverlap;
    });
  }, [ownedSpaces]);

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload,
    loadOwnedSpaces,
    checkSpaceOverlap
  };
};