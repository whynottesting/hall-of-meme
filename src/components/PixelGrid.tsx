import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PixelGridProps {
  selectedCells: { x: number; y: number; width: number; height: number } | null;
  ownedCells: Array<{ x: number; y: number; width: number; height: number; image: string; link: string }>;
  onCellClick: (x: number, y: number) => void;
}

interface ProcessedCell extends Omit<PixelGridProps['ownedCells'][0], 'image'> {
  processedImageUrl: string;
}

const PixelGrid: React.FC<PixelGridProps> = ({ selectedCells, ownedCells, onCellClick }) => {
  const [processedCells, setProcessedCells] = useState<ProcessedCell[]>([]);

  useEffect(() => {
    const processImages = async () => {
      const processed = await Promise.all(
        ownedCells.map(async (owned) => {
          console.log('Owned cell data:', owned);
          
          let imageUrl = owned.image;
          console.log('Initial image URL:', imageUrl);

          if (imageUrl) {
            if (imageUrl.startsWith('http')) {
              console.log('URL complète détectée:', imageUrl);
            } else {
              console.log('URL relative détectée, construction de l\'URL Supabase...');
              const cleanPath = imageUrl.replace('public/lovable-uploads/', '');
              console.log('Chemin nettoyé:', cleanPath);
              
              // Vérifier si le fichier existe dans le bucket
              const { data: fileExists } = await supabase.storage
                .from('space-images')
                .list('', {
                  search: cleanPath
                });
              
              console.log('Vérification existence fichier:', fileExists);
              
              const { data: { publicUrl } } = supabase.storage
                .from('space-images')
                .getPublicUrl(cleanPath);
              
              imageUrl = publicUrl;
              console.log('URL Supabase construite:', imageUrl);
            }
          } else {
            console.log('Aucune URL d\'image trouvée pour cette cellule');
          }

          return {
            ...owned,
            processedImageUrl: imageUrl
          };
        })
      );
      setProcessedCells(processed);
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

  const getOwnedCell = (x: number, y: number) => {
    return processedCells.find(cell => 
      x >= cell.x &&
      x < cell.x + cell.width &&
      y >= cell.y &&
      y < cell.y + cell.height
    );
  };

  const handleCellClick = (x: number, y: number, ownedCell: ProcessedCell | undefined) => {
    if (ownedCell && ownedCell.link) {
      window.open(ownedCell.link, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  };

  const renderOwnedCells = () => {
    return processedCells.map((owned) => (
      <div
        key={`owned-${owned.x}-${owned.y}`}
        className="absolute"
        style={{
          left: `${owned.x}%`,
          top: `${owned.y}%`,
          width: `${owned.width}%`,
          height: `${owned.height}%`,
          backgroundColor: '#ffffff',
          border: '1px solid rgba(26, 43, 60, 0.1)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => handleCellClick(owned.x, owned.y, owned)}
        title={owned.link}
      >
        {owned.processedImageUrl && (
          <img
            src={owned.processedImageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
            onError={(e) => {
              console.error('Erreur de chargement de l\'image:', {
                url: owned.processedImageUrl,
                error: e
              });
              e.currentTarget.src = '/placeholder.svg';
            }}
            onLoad={() => {
              console.log('Image chargée avec succès:', owned.processedImageUrl);
            }}
          />
        )}
      </div>
    ));
  };

  const renderEmptyCells = () => {
    const grid = [];
    const processedCells = new Set(
      ownedCells.flatMap(owned => 
        Array.from({ length: owned.height }, (_, dy) =>
          Array.from({ length: owned.width }, (_, dx) =>
            `${owned.x + dx}-${owned.y + dy}`
          )
        ).flat()
      )
    );

    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const cellKey = `${x}-${y}`;
        if (!processedCells.has(cellKey)) {
          const selected = isSelected(x, y);
          grid.push(
            <div
              key={cellKey}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: '1%',
                height: '1%',
                border: '1px solid rgba(26, 43, 60, 0.1)',
              }}
              className={cn(
                "pixel-cell",
                selected && "bg-blue-100",
                "hover:bg-gray-100"
              )}
              onClick={() => handleCellClick(x, y, undefined)}
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
        {renderEmptyCells()}
        {renderOwnedCells()}
      </div>
    </div>
  );
};

export default PixelGrid;