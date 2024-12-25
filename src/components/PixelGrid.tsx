import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import EmptyCell from './grid/EmptyCell';
import OwnedCell from './grid/OwnedCell';
import DebugPanel from './grid/DebugPanel';

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
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    const processImages = async () => {
      try {
        const processed = await Promise.all(
          ownedCells.map(async (cell) => {
            let imageUrl = cell.image;
            
            if (imageUrl) {
              // Si l'URL commence par 'public/lovable-uploads/', on la traite comme une image Supabase
              if (imageUrl.startsWith('public/lovable-uploads/')) {
                const cleanPath = imageUrl.replace('public/lovable-uploads/', '');
                const { data: { publicUrl } } = supabase.storage
                  .from('space-images')
                  .getPublicUrl(cleanPath);
                
                imageUrl = publicUrl;
                setDebug(prev => [...prev, `URL publique générée: ${publicUrl}`]);
              }
              
              setDebug(prev => [...prev, `Image traitée: ${imageUrl}`]);
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
        setDebug(prev => [...prev, `Erreur: ${error.message}`]);
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
    const processedPositions = new Set(
      processedCells.flatMap(owned => 
        Array.from({ length: owned.height }, (_, dy) =>
          Array.from({ length: owned.width }, (_, dx) =>
            `${owned.x + dx}-${owned.y + dy}`
          )
        ).flat()
      )
    );

    // Rendu des cellules vides
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const cellKey = `${x}-${y}`;
        if (!processedPositions.has(cellKey)) {
          grid.push(
            <EmptyCell
              key={cellKey}
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
    <div className="space-y-4">
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
      
      <DebugPanel messages={debug} />
    </div>
  );
};

export default PixelGrid;