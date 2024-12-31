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

  // Memoize the image processing function
  const processImages = useCallback(async (cells: Space[]) => {
    if (!cells || cells.length === 0) {
      console.log("❌ Aucune cellule à traiter");
      setProcessedCells([]);
      return;
    }

    const processed = await Promise.all(
      cells.map(async (cell) => {
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
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Only run when ownedCells changes
  useEffect(() => {
    processImages(ownedCells);
  }, [ownedCells, processImages]);

  // Memoize the selection check
  const isSelected = useCallback((x: number, y: number) => {
    if (!selectedCells) return false;
    return (
      x >= selectedCells.x &&
      x < selectedCells.x + selectedCells.width &&
      y >= selectedCells.y &&
      y < selectedCells.y + selectedCells.height
    );
  }, [selectedCells]);

  // Memoize cell click handler
  const handleCellClick = useCallback((x: number, y: number, cell?: ProcessedCell) => {
    if (cell?.url) {
      window.open(cell.url, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  }, [onCellClick]);

  // Create a map of occupied positions for faster lookup
  const occupiedPositions = useMemo(() => {
    const positions = new Map<string, ProcessedCell>();
    processedCells.forEach(cell => {
      for (let dy = 0; dy < cell.height; dy++) {
        for (let dx = 0; dx < cell.width; dx++) {
          positions.set(`${cell.x + dx}-${cell.y + dy}`, cell);
        }
      }
    });
    return positions;
  }, [processedCells]);

  // Render the grid more efficiently
  const renderGrid = useMemo(() => {
    const grid = [];
    const gridSize = 100;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x}-${y}`;
        const occupiedCell = occupiedPositions.get(key);

        if (occupiedCell && occupiedCell.x === x && occupiedCell.y === y) {
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
        } else if (!occupiedPositions.has(key)) {
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