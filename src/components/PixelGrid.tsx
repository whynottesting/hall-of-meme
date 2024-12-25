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
    // Si l'URL commence par 'public/', on ajoute l'URL de Supabase Storage
    if (imageUrl.startsWith('public/')) {
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/space-images/${imageUrl}`;
    }
    return imageUrl;
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const owned = getOwnedCell(x, y);
        const selected = isSelected(x, y);
        const isMainCell = owned && x === owned.x && y === owned.y;

        if (isMainCell) {
          const imageUrl = owned.image ? getImageUrl(owned.image) : undefined;
          console.log('Cell image URL:', imageUrl); // Pour le débogage

          grid.push(
            <div
              key={`${x}-${y}`}
              className={cn(
                "relative cursor-pointer",
                "transition-all duration-200",
                "hover:opacity-90"
              )}
              style={{
                gridColumn: `${x + 1} / span ${owned.width}`,
                gridRow: `${y + 1} / span ${owned.height}`,
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #1a2b3c',
                backgroundColor: imageUrl ? undefined : '#e5e7eb'
              }}
              onClick={() => handleCellClick(x, y, owned)}
              title={owned.link}
            />
          );
          x += owned.width - 1; // Skip cells covered by this space
        } else if (!owned) {
          grid.push(
            <div
              key={`${x}-${y}`}
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
              onClick={() => handleCellClick(x, y, owned)}
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