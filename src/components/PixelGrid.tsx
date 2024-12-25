import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import EmptyCell from './grid/EmptyCell';
import OwnedCell from './grid/OwnedCell';

interface PixelGridProps {
  selectedCells: { x: number; y: number; width: number; height: number } | null;
  ownedCells: Array<{ x: number; y: number; width: number; height: number; image: string; link: string }>;
  onCellClick: (x: number, y: number) => void;
}

interface ProcessedCell {
  x: number;
  y: number;
  width: number;
  height: number;
  link: string;
  processedImageUrl: string;
}

const PixelGrid: React.FC<PixelGridProps> = ({ selectedCells, ownedCells, onCellClick }) => {
  const [processedCells, setProcessedCells] = useState<ProcessedCell[]>([]);

  useEffect(() => {
    const processImages = async () => {
      try {
        const processed = await Promise.all(
          ownedCells.map(async (cell) => {
            let imageUrl = cell.image;
            
            if (imageUrl) {
              if (imageUrl.startsWith('public/lovable-uploads/')) {
                const cleanPath = imageUrl.replace('public/lovable-uploads/', '');
                const { data: { publicUrl } } = supabase.storage
                  .from('space-images')
                  .getPublicUrl(cleanPath);
                
                imageUrl = publicUrl;
              }
            }

            return {
              ...cell,
              processedImageUrl: imageUrl
            };
          })
        );
        setProcessedCells(processed);
      } catch (error) {
        console.error('Erreur lors du traitement des images:', error);
      }
    };

    processImages();
  }, [ownedCells]);

  const isSelected = (x: number, y: number) => {
    if (!selectedCells) return false;
    return (
      x >= selectedCells.x &&
      x < selectedCells.x + selectedCells.width &&
      y >= selectedCells.y &&
      y < selectedCells.y + selectedCells.height
    );
  };

  const handleCellClick = (x: number, y: number, cell?: ProcessedCell) => {
    if (cell?.link) {
      window.open(cell.link, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  };

  const renderGrid = () => {
    const grid = [];
    const occupiedPositions = new Set();

    // Marquer d'abord toutes les positions occupées
    processedCells.forEach(cell => {
      for (let dy = 0; dy < cell.height; dy++) {
        for (let dx = 0; dx < cell.width; dx++) {
          occupiedPositions.add(`${cell.x + dx}-${cell.y + dy}`);
        }
      }
    });

    // Rendu des cellules vides
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const key = `${x}-${y}`;
        if (!occupiedPositions.has(key)) {
          grid.push(
            <EmptyCell
              key={key}
              x={x}
              y={y}
              isSelected={isSelected(x, y)}
              onClick={() => handleCellClick(x, y)}
            />
          );
        }
      }
    }

    // Rendu des cellules possédées
    processedCells.forEach((cell) => {
      grid.push(
        <OwnedCell
          key={`owned-${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          imageUrl={cell.processedImageUrl}
          link={cell.link}
          onClick={() => handleCellClick(cell.x, cell.y, cell)}
        />
      );
    });

    return grid;
  };

  return (
    <div 
      className="pixel-grid relative"
      style={{
        width: '100%',
        paddingTop: '100%',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e2e8f0',
      }}
    >
      <div className="absolute inset-0">
        {renderGrid()}
      </div>
    </div>
  );
};

export default PixelGrid;