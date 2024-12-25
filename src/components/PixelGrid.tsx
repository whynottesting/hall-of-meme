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

  const handleCellClick = (x: number, y: number, ownedCell?: typeof ownedCells[0]) => {
    if (ownedCell) {
      window.open(ownedCell.link, '_blank');
    } else {
      onCellClick(x, y);
    }
  };

  const getCellStyle = (x: number, y: number, ownedCell?: typeof ownedCells[0]) => {
    if (!ownedCell) return {};

    // Calculate the position of this cell within its owned space
    const relativeX = x - ownedCell.x;
    const relativeY = y - ownedCell.y;

    // Only apply background image to the top-left cell of the owned space
    if (relativeX === 0 && relativeY === 0) {
      return {
        backgroundImage: `url(${ownedCell.image})`,
        backgroundSize: `${ownedCell.width * 100}% ${ownedCell.height * 100}%`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        cursor: 'pointer',
        width: `${ownedCell.width * 100}%`,
        height: `${ownedCell.height * 100}%`,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        zIndex: 1
      };
    }

    return {
      opacity: 0
    };
  };

  return (
    <div className="pixel-grid">
      {Array.from({ length: 100 }, (_, y) =>
        Array.from({ length: 100 }, (_, x) => {
          const owned = getOwnedCell(x, y);
          const selected = isSelected(x, y);
          
          return (
            <div
              key={`${x}-${y}`}
              className={cn(
                "pixel-cell",
                selected && "selected",
                owned && "owned"
              )}
              style={{
                position: 'relative',
                ...getCellStyle(x, y, owned)
              }}
              onClick={() => handleCellClick(x, y, owned)}
              title={owned ? `Click to visit: ${owned.link}` : `Position: ${x},${y}`}
            />
          );
        })
      )}
    </div>
  );
};

export default PixelGrid;