import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import EmptyCell from './grid/EmptyCell';
import OwnedCell from './grid/OwnedCell';
import { Space } from '@/utils/solana/types';

interface PixelGridProps {
  selectedCells: { x: number; y: number; width: number; height: number } | null;
  ownedCells: Space[];
  onCellClick: (x: number, y: number) => void;
}

interface ProcessedCell extends Space {
  processedImageUrl: string;
}

const PixelGrid: React.FC<PixelGridProps> = ({ selectedCells, ownedCells, onCellClick }) => {
  const [processedCells, setProcessedCells] = useState<ProcessedCell[]>([]);

  useEffect(() => {
    console.log("🔄 Mise à jour des cellules possédées:", ownedCells);
    
    const processImages = async () => {
      try {
        if (!ownedCells || ownedCells.length === 0) {
          console.log("❌ Aucune cellule à traiter");
          setProcessedCells([]);
          return;
        }

        const processed = await Promise.all(
          ownedCells.map(async (cell) => {
            if (!cell.image_url) {
              return { ...cell, processedImageUrl: '' };
            }

            const { data: { publicUrl } } = supabase.storage
              .from('space-images')
              .getPublicUrl(cell.image_url);
            
            return {
              ...cell,
              processedImageUrl: publicUrl
            };
          })
        );
        
        setProcessedCells(processed);
      } catch (error) {
        console.error('Erreur lors du traitement des images:', error);
        setProcessedCells([]);
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
    if (cell?.url) {
      window.open(cell.url, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  };

  const renderGrid = () => {
    const grid = [];
    const occupiedPositions = new Map<string, ProcessedCell>();

    // Create a map of occupied positions
    processedCells.forEach(cell => {
      for (let dy = 0; dy < cell.height; dy++) {
        for (let dx = 0; dx < cell.width; dx++) {
          occupiedPositions.set(`${cell.x + dx}-${cell.y + dy}`, cell);
        }
      }
    });

    // Render empty and owned cells
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const key = `${x}-${y}`;
        const occupiedCell = occupiedPositions.get(key);

        if (occupiedCell) {
          // Only render the OwnedCell at its origin position
          if (x === occupiedCell.x && y === occupiedCell.y) {
            grid.push(
              <OwnedCell
                key={`owned-${key}`}
                x={occupiedCell.x}
                y={occupiedCell.y}
                width={occupiedCell.width}
                height={occupiedCell.height}
                imageUrl={occupiedCell.processedImageUrl}
                link={occupiedCell.url || ''}
                onClick={() => handleCellClick(x, y, occupiedCell)}
              />
            );
          }
        } else {
          grid.push(
            <EmptyCell
              key={`empty-${key}`}
              x={x}
              y={y}
              isSelected={isSelected(x, y)}
              onClick={() => handleCellClick(x, y)}
            />
          );
        }
      }
    }

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