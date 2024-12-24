import React from 'react';
import { Input } from "@/components/ui/input";

interface SpaceFormDimensionsProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onInputChange: (field: string, value: number) => void;
  isProcessing: boolean;
}

const SpaceFormDimensions = ({
  x,
  y,
  width,
  height,
  onInputChange,
  isProcessing
}: SpaceFormDimensionsProps) => {
  return (
    <>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-pixel mb-1">X Position</label>
        <Input
          type="number"
          value={x}
          onChange={(e) => onInputChange('x', parseInt(e.target.value))}
          className="retro-input h-8"
          min={0}
          max={99}
          disabled={isProcessing}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-pixel mb-1">Y Position</label>
        <Input
          type="number"
          value={y}
          onChange={(e) => onInputChange('y', parseInt(e.target.value))}
          className="retro-input h-8"
          min={0}
          max={99}
          disabled={isProcessing}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-pixel mb-1">Width</label>
        <Input
          type="number"
          value={width}
          onChange={(e) => onInputChange('width', parseInt(e.target.value))}
          className="retro-input h-8"
          min={1}
          max={100}
          disabled={isProcessing}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-pixel mb-1">Height</label>
        <Input
          type="number"
          value={height}
          onChange={(e) => onInputChange('height', parseInt(e.target.value))}
          className="retro-input h-8"
          min={1}
          max={100}
          disabled={isProcessing}
        />
      </div>
    </>
  );
};

export default SpaceFormDimensions;