import React from 'react';
import { cn } from "@/lib/utils";

interface PixelGridProps {
  selectedCells: { x: number; y: number; width: number; height: number } | null;
  ownedCells: Array<{ x: number; y: number; width: number; height: number; image: string; link: string }>;
  onCellClick: (x: number, y: number) => void;
}

const PixelGrid: React.FC<PixelGridProps> = ({ selectedCells, ownedCells, onCellClick }) => {
  console.log('Rendering PixelGrid with owned cells:', ownedCells);

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
    const cell = ownedCells.find(cell => 
      x >= cell.x &&
      x < cell.x + cell.width &&
      y >= cell.y &&
      y < cell.y + cell.height
    );
    if (cell) {
      console.log(`Found owned cell at ${x},${y}:`, cell);
    }
    return cell;
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
    
    const isMainCell = owned && x === owned.x && y === owned.y;
    
    if (!owned || isMainCell || selected) {
      let cellStyle: React.CSSProperties = {};
      
      if (owned && isMainCell) {
        console.log('Rendering owned cell at', x, y, 'with image:', owned.image);
        cellStyle = {
          backgroundImage: owned.image ? `url(${owned.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: `${owned.width * 100}%`,
          height: `${owned.height * 100}%`,
          gridColumn: `span ${owned.width}`,
          gridRow: `span ${owned.height}`,
          cursor: owned.link ? 'pointer' : 'default',
          border: '1px solid rgba(26, 43, 60, 0.1)',
          position: 'relative',
          zIndex: 1
        };
      }

      return (
        <div
          key={`${x}-${y}`}
          className={cn(
            "pixel-cell",
            selected && "selected",
            owned && "owned",
            "relative"
          )}
          style={cellStyle}
          onClick={() => handleCellClick(x, y, owned)}
          title={owned ? `Click to visit: ${owned.link}` : `Position: ${x},${y}`}
        >
          {owned && isMainCell && !owned.image && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              No image
            </div>
          )}
        </div>
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