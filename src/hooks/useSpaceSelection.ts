import { useState } from 'react';

interface Space {
  x: number;
  y: number;
  width: number;
  height: number;
  link: string;
}

export const useSpaceSelection = () => {
  const [selectedSpace, setSelectedSpace] = useState<Space>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    link: '',
  });

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

  return {
    selectedSpace,
    handleSpaceSelection,
    handleInputChange,
  };
};