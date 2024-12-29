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
      const newSpaceRight = newSpace.x + newSpace.width;
      const newSpaceBottom = newSpace.y + newSpace.height;
      const existingSpaceRight = existingSpace.x + existingSpace.width;
      const existingSpaceBottom = existingSpace.y + existingSpace.height;

      const xOverlap = newSpace.x < existingSpaceRight && newSpaceRight > existingSpace.x;
      const yOverlap = newSpace.y < existingSpaceBottom && newSpaceBottom > existingSpace.y;

      return xOverlap && yOverlap;
    });
  }, [ownedSpaces]);

  return {
    selectedSpace: spaceSelection.selectedSpace,
    ownedSpaces,
    setOwnedSpaces,
    handleSpaceSelection: spaceSelection.handleSpaceSelection,
    handleInputChange: spaceSelection.handleInputChange,
    handleImageUpload,
    loadOwnedSpaces,
    checkSpaceOverlap
  };
};