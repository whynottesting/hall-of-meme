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

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < 100; y++) {
      const row = [];
      for (let x = 0; x < 100; x++) {
        const owned = getOwnedCell(x, y);
        const selected = isSelected(x, y);
        const isMainCell = owned && x === owned.x && y === owned.y;

        // Si c'est une cellule principale d'un espace possédé
        if (isMainCell) {
          row.push(
            <div
              key={`${x}-${y}`}
              className={cn(
                "relative cursor-pointer",
                "transition-all duration-200",
                "hover:opacity-90"
              )}
              style={{
                gridColumn: `span ${owned.width}`,
                gridRow: `span ${owned.height}`,
                backgroundImage: `url(${owned.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #1a2b3c'
              }}
              onClick={() => handleCellClick(x, y, owned)}
              title={owned.link}
            />
          );
          x += owned.width - 1; // Sauter les cellules couvertes par cet espace
        }
        // Si ce n'est pas une cellule couverte par un espace possédé
        else if (!owned) {
          row.push(
            <div
              key={`${x}-${y}`}
              className={cn(
                "w-full h-full",
                "border border-gray-200",
                "transition-colors duration-200",
                "hover:bg-gray-100",
                selected && "bg-blue-200 hover:bg-blue-300"
              )}
              onClick={() => handleCellClick(x, y, owned)}
            />
          );
        }
      }
      grid.push(row);
    }
    return grid;
  };

  return (
    <div 
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(100, 1fr)',
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