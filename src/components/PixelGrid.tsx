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

  const getCellStyle = (x: number, y: number) => {
    const owned = getOwnedCell(x, y);
    if (!owned) return {};

    // Calculate the position of this cell within its owned space
    const relativeX = x - owned.x;
    const relativeY = y - owned.y;

    // Calculate background-position in percentage
    const bgPosX = -(relativeX * (100 / owned.width));
    const bgPosY = -(relativeY * (100 / owned.height));

    return {
      backgroundImage: `url(${owned.image})`,
      backgroundSize: `${owned.width * 100}% ${owned.height * 100}%`,
      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      backgroundRepeat: 'no-repeat'
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
              style={getCellStyle(x, y)}
              onClick={() => onCellClick(x, y)}
              title={owned ? `Click to visit: ${owned.link}` : `Position: ${x},${y}`}
            />
          );
        })
      )}
    </div>
  );
};

export default PixelGrid;