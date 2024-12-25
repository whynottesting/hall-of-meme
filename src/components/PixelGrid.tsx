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

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return undefined;
    const baseUrl = "https://jkfkzqxmqxognavlbcng.supabase.co/storage/v1/object/public/space-images";
    return `${baseUrl}/${imageUrl}`;
  };

  const renderGrid = () => {
    const grid = [];
    const processedCells = new Set(); // Pour suivre les cellules déjà traitées

    // D'abord, ajoutons les cellules occupées
    for (const owned of ownedCells) {
      const imageUrl = owned.image ? getImageUrl(owned.image) : undefined;
      grid.push(
        <div
          key={`${owned.x}-${owned.y}`}
          className={cn(
            "relative cursor-pointer",
            "transition-all duration-200",
            "hover:opacity-90"
          )}
          style={{
            gridColumn: `${owned.x + 1} / span ${owned.width}`,
            gridRow: `${owned.y + 1} / span ${owned.height}`,
            backgroundImage: imageUrl ? `url('${imageUrl}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: '1px solid #1a2b3c',
            backgroundColor: imageUrl ? undefined : '#e5e7eb',
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            objectFit: 'cover'
          }}
          onClick={() => handleCellClick(owned.x, owned.y, owned)}
          title={owned.link}
        />
      );

      // Marquer toutes les cellules de cet espace comme traitées
      for (let y = owned.y; y < owned.y + owned.height; y++) {
        for (let x = owned.x; x < owned.x + owned.width; x++) {
          processedCells.add(`${x}-${y}`);
        }
      }
    }

    // Ensuite, ajoutons les cellules vides
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
      {renderGrid()}
    </div>
  );
};

export default PixelGrid;