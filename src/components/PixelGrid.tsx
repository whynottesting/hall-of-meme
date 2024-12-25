import React from 'react';
import { cn } from "@/lib/utils";

interface PixelGridProps {
  selectedCells: { x: number; y: number; width: number; height: number } | null;
  ownedCells: Array<{ x: number; y: number; width: number; height: number; image: string; link: string }>;
  onCellClick: (x: number, y: number) => void;
}

const PixelGrid: React.FC<PixelGridProps> = ({ selectedCells, ownedCells, onCellClick }) => {
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
    return ownedCells.find(cell => 
      x >= cell.x &&
      x < cell.x + cell.width &&
      y >= cell.y &&
      y < cell.y + cell.height
    );
  };

  const handleCellClick = (x: number, y: number, ownedCell: typeof ownedCells[0] | undefined) => {
    if (ownedCell && ownedCell.link) {
      window.open(ownedCell.link, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  };

  const renderOwnedCells = () => {
    return ownedCells.map(owned => {
      const imageUrl = owned.image?.startsWith('http') 
        ? owned.image 
        : `https://jkfkzqxmqxognavlbcng.supabase.co/storage/v1/object/public/space-images/${owned.image}`;

      console.log('Tentative de chargement de l\'image:', imageUrl);

      return (
        <div
          key={`owned-${owned.x}-${owned.y}`}
          className="relative"
          style={{
            gridColumn: `${owned.x + 1} / span ${owned.width}`,
            gridRow: `${owned.y + 1} / span ${owned.height}`,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            border: '1px solid #1a2b3c',
            overflow: 'hidden',
            aspectRatio: `${owned.width} / ${owned.height}`
          }}
          onClick={() => handleCellClick(owned.x, owned.y, owned)}
          title={owned.link}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                console.error('Erreur de chargement de l\'image:', {
                  url: imageUrl,
                  error: e
                });
                e.currentTarget.src = '/placeholder.svg';
              }}
              onLoad={() => {
                console.log('Image chargée avec succès:', imageUrl);
              }}
            />
          )}
        </div>
      );
    });
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
                gridColumn: x + 1,
                gridRow: y + 1,
              }}
              className={cn(
                "pixel-cell",
                selected && "selected",
                "transition-colors duration-200",
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
      className="pixel-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(100, 1fr)',
        gridTemplateRows: 'repeat(100, 1fr)',
        gap: '0px',
        width: '100%',
        aspectRatio: '1/1',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e2e8f0'
      }}
    >
      {renderEmptyCells()}
      {renderOwnedCells()}
    </div>
  );
};

export default PixelGrid;