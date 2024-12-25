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

      return (
        <div
          key={`owned-${owned.x}-${owned.y}`}
          className="absolute"
          style={{
            left: `${owned.x * 1}%`,
            top: `${owned.y * 1}%`,
            width: `${owned.width * 1}%`,
            height: `${owned.height * 1}%`,
            cursor: 'pointer',
          }}
          onClick={() => handleCellClick(owned.x, owned.y, owned)}
          title={owned.link}
        >
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              border: '1px solid rgba(26, 43, 60, 0.5)',
              overflow: 'hidden',
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                className="max-w-full max-h-full object-contain p-1"
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