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
    const processedCells = new Set();

    // Render owned cells first
    ownedCells.forEach(owned => {
      const imageUrl = owned.image 
        ? `https://jkfkzqxmqxognavlbcng.supabase.co/storage/v1/object/public/space-images/${owned.image}`
        : undefined;

      console.log('Rendering owned cell:', {
        coordinates: `(${owned.x}, ${owned.y})`,
        dimensions: `${owned.width}x${owned.height}`,
        imageUrl
      });

      grid.push(
        <div
          key={`owned-${owned.x}-${owned.y}`}
          style={{
            gridColumn: `${owned.x + 1} / span ${owned.width}`,
            gridRow: `${owned.y + 1} / span ${owned.height}`,
            position: 'relative',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            border: '1px solid #1a2b3c',
          }}
          onClick={() => handleCellClick(owned.x, owned.y, owned)}
          title={owned.link}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              onError={(e) => console.error('Image loading error:', e)}
              onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            />
          )}
        </div>
      );

      // Mark cells as processed
      for (let y = owned.y; y < owned.y + owned.height; y++) {
        for (let x = owned.x; x < owned.x + owned.width; x++) {
          processedCells.add(`${x}-${y}`);
        }
      }
    });

    // Render empty cells
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