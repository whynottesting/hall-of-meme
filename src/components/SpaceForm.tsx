import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SpaceFormProps {
  x: number;
  y: number;
  width: number;
  height: number;
  link: string;
  onInputChange: (field: string, value: number | string) => void;
  onImageUpload: (file: File) => void;
  onSubmit: () => void;
  price: number;
}

const SpaceForm: React.FC<SpaceFormProps> = ({
  x,
  y,
  width,
  height,
  link,
  onInputChange,
  onImageUpload,
  onSubmit,
  price
}) => {
  return (
    <div className="bg-secondary p-4 rounded-lg">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-pixel mb-1">X Position</label>
          <Input
            type="number"
            value={x}
            onChange={(e) => onInputChange('x', parseInt(e.target.value))}
            className="retro-input h-8"
            min={0}
            max={99}
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
          />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-xs font-pixel mb-1">Link URL</label>
          <Input
            type="url"
            value={link}
            onChange={(e) => onInputChange('link', e.target.value)}
            className="retro-input h-8"
            placeholder="https://"
          />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-xs font-pixel mb-1">Image</label>
          <Input
            type="file"
            onChange={(e) => e.target.files && onImageUpload(e.target.files[0])}
            className="retro-input h-8"
            accept="image/*"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right font-pixel text-xs whitespace-nowrap">
            Price: {price.toFixed(2)} SOL
          </div>
          <Button
            onClick={onSubmit}
            className="retro-button h-8 px-4 py-0 whitespace-nowrap"
          >
            Secure Your Space
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpaceForm;