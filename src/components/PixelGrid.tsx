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
      window.open(ownedCell.link, '_blank');
    } else {
      onCellClick(x, y);
    }
  };

  const renderCell = (x: number, y: number) => {
    const owned = getOwnedCell(x, y);
    const selected = isSelected(x, y);
    
    // Check if this is the top-left cell of an owned space
    const isMainCell = owned && x === owned.x && y === owned.y;
    
    // Only render cells that are either:
    // 1. Not part of an owned space
    // 2. The main cell of an owned space
    // 3. Selected cells
    if (!owned || isMainCell || selected) {
      return (
        <div
          key={`${x}-${y}`}
          className={cn(
            "pixel-cell",
            selected && "selected",
            owned && "owned"
          )}
          style={owned && isMainCell ? {
            backgroundImage: `url(${owned.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: `${owned.width * 100}%`,
            height: `${owned.height * 100}%`,
            gridColumn: `span ${owned.width}`,
            gridRow: `span ${owned.height}`,
            cursor: owned.link ? 'pointer' : 'default'
          } : {}}
          onClick={() => handleCellClick(x, y, owned)}
          title={owned ? `Click to visit: ${owned.link}` : `Position: ${x},${y}`}
        />
      );
    }
    return null;
  };

  return (
    <div className="pixel-grid">
      {Array.from({ length: 100 }, (_, y) =>
        Array.from({ length: 100 }, (_, x) => renderCell(x, y))
      )}
    </div>
  );
};

export default PixelGrid;