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
            console.log("📸 Traitement de la cellule:", cell);
            let imageUrl = cell.image_url || '';
            
            if (imageUrl) {
              // Si l'URL commence par public/lovable-uploads/, on la convertit en URL publique Supabase
              if (imageUrl.startsWith('public/lovable-uploads/')) {
                console.log("🔄 Conversion de l'URL de l'image:", imageUrl);
                const cleanPath = imageUrl.replace('public/lovable-uploads/', '');
                const { data: { publicUrl } } = supabase.storage
                  .from('space-images')
                  .getPublicUrl(cleanPath);
                
                imageUrl = publicUrl;
                console.log("✅ URL publique générée:", imageUrl);
              }
            }

            return {
              ...cell,
              processedImageUrl: imageUrl
            };
          })
        );
        console.log("✅ Cellules traitées:", processed);
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
    const occupiedPositions = new Set();

    // Traiter d'abord les cellules occupées
    if (processedCells && processedCells.length > 0) {
      processedCells.forEach(cell => {
        console.log("📍 Position occupée:", cell);
        for (let dy = 0; dy < cell.height; dy++) {
          for (let dx = 0; dx < cell.width; dx++) {
            occupiedPositions.add(`${cell.x + dx}-${cell.y + dy}`);
          }
        }
      });
    }

    // Rendre les cellules vides
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

    // Rendre les cellules possédées
    if (processedCells && processedCells.length > 0) {
      processedCells.forEach((cell) => {
        console.log("🎨 Rendu de la cellule possédée:", cell);
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