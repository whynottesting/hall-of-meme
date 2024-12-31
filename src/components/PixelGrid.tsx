import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const processImages = useCallback(async () => {
    if (!ownedCells || ownedCells.length === 0) {
      console.log("❌ Aucune cellule à traiter");
      setProcessedCells([]);
      return;
    }

    const processed = await Promise.all(
      ownedCells.map(async (cell) => {
        let imageUrl = '';
        if (cell.image_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('space-images')
            .getPublicUrl(cell.image_url);
          imageUrl = publicUrl;
        }
        return { ...cell, processedImageUrl: imageUrl };
      })
    );
    
    setProcessedCells(processed);
  }, [ownedCells]);

  useEffect(() => {
    processImages();
  }, [processImages]);

  const isSelected = useCallback((x: number, y: number) => {
    if (!selectedCells) return false;
    return (
      x >= selectedCells.x &&
      x < selectedCells.x + selectedCells.width &&
      y >= selectedCells.y &&
      y < selectedCells.y + selectedCells.height
    );
  }, [selectedCells]);

  const handleCellClick = useCallback((x: number, y: number, cell?: ProcessedCell) => {
    if (cell?.url) {
      window.open(cell.url, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  }, [onCellClick]);

  const occupiedPositions = useMemo(() => {
    const positions = new Set<string>();
    if (processedCells && processedCells.length > 0) {
      processedCells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
          for (let dx = 0; dx < cell.width; dx++) {
            positions.add(`${cell.x + dx}-${cell.y + dy}`);
          }
        }
      });
    }
    return positions;
  }, [processedCells]);

  const renderGrid = useMemo(() => {
    const grid = [];

    // Render empty cells
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

    // Render owned cells
    processedCells.forEach((cell) => {
      grid.push(
        <OwnedCell
          key={`owned-${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          imageUrl={cell.processedImageUrl}
          link={cell.url || ''}
          onClick={() => handleCellClick(cell.x, cell.y, cell)}
        />
      );
    });

    return grid;
  }, [processedCells, occupiedPositions, isSelected, handleCellClick]);

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
        {renderGrid}
      </div>
    </div>
  );
};

export default PixelGrid;