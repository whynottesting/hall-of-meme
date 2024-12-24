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
    <div className="space-y-4 max-w-md mx-auto bg-secondary p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-pixel mb-1">X Position</label>
          <Input
            type="number"
            value={x}
            onChange={(e) => onInputChange('x', parseInt(e.target.value))}
            className="retro-input"
            min={0}
            max={99}
          />
        </div>
        <div>
          <label className="block text-sm font-pixel mb-1">Y Position</label>
          <Input
            type="number"
            value={y}
            onChange={(e) => onInputChange('y', parseInt(e.target.value))}
            className="retro-input"
            min={0}
            max={99}
          />
        </div>
        <div>
          <label className="block text-sm font-pixel mb-1">Width</label>
          <Input
            type="number"
            value={width}
            onChange={(e) => onInputChange('width', parseInt(e.target.value))}
            className="retro-input"
            min={1}
            max={100}
          />
        </div>
        <div>
          <label className="block text-sm font-pixel mb-1">Height</label>
          <Input
            type="number"
            value={height}
            onChange={(e) => onInputChange('height', parseInt(e.target.value))}
            className="retro-input"
            min={1}
            max={100}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-pixel mb-1">Link URL</label>
        <Input
          type="url"
          value={link}
          onChange={(e) => onInputChange('link', e.target.value)}
          className="retro-input"
          placeholder="https://"
        />
      </div>
      
      <div>
        <label className="block text-sm font-pixel mb-1">Image</label>
        <Input
          type="file"
          onChange={(e) => e.target.files && onImageUpload(e.target.files[0])}
          className="retro-input"
          accept="image/*"
        />
      </div>
      
      <div className="text-right font-pixel text-sm">
        Price: {price.toFixed(2)} SOL
      </div>
      
      <Button
        onClick={onSubmit}
        className="retro-button w-full"
      >
        Secure Your Space
      </Button>
    </div>
  );
};

export default SpaceForm;