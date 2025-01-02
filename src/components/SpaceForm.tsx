import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SpaceFormDimensions from './SpaceFormDimensions';
import SpaceFormMedia from './SpaceFormMedia';

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
  isProcessing: boolean;
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
  price,
  isProcessing
}) => {
  const actualPrice = width * height * 100 * 0.01;

  return (
    <div className="bg-secondary p-4 pt-2 rounded-lg">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-4 flex-1">
          <SpaceFormDimensions
            x={x}
            y={y}
            width={width}
            height={height}
            onInputChange={(field, value) => onInputChange(field, value)}
            isProcessing={isProcessing}
          />
          <SpaceFormMedia
            link={link}
            onInputChange={onInputChange}
            onImageUpload={onImageUpload}
            isProcessing={isProcessing}
          />
        </div>
        <div className="flex flex-col items-end gap-2 ml-auto self-end">
          <Button
            onClick={onSubmit}
            className="retro-button h-8 px-4 py-0 whitespace-nowrap"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Secure Your Space'
            )}
          </Button>
          <div className="text-right font-pixel text-xs whitespace-nowrap">
            Price: {actualPrice.toFixed(2)} SOL
            <div className="text-[10px] text-muted-foreground">
              ({width * height} squares = {width * height * 100} pixels)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceForm;