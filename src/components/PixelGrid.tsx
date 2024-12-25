import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PixelGridProps {
  selectedCells: { x: number; y: number; width: number; height: number } | null;
  ownedCells: Array<{ x: number; y: number; width: number; height: number; image: string; link: string }>;
  onCellClick: (x: number, y: number) => void;
}

interface ProcessedCell {
  x: number;
  y: number;
  width: number;
  height: number;
  link: string;
  processedImageUrl: string;
}

const PixelGrid: React.FC<PixelGridProps> = ({ selectedCells, ownedCells, onCellClick }) => {
  const [processedCells, setProcessedCells] = useState<ProcessedCell[]>([]);
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    const processImages = async () => {
      try {
        // Lister tous les fichiers dans le bucket
        const { data: files, error: listError } = await supabase.storage
          .from('space-images')
          .list();

        if (listError) {
          console.error('Erreur lors de la liste des fichiers:', listError);
          setDebug(prev => [...prev, `Erreur liste fichiers: ${listError.message}`]);
        } else {
          console.log('Fichiers dans le bucket:', files);
          setDebug(prev => [...prev, `Fichiers trouvés: ${files?.map(f => f.name).join(', ')}`]);
        }

        const processed = await Promise.all(
          ownedCells.map(async (cell) => {
            let imageUrl = cell.image;
            console.log('Traitement cellule:', cell);
            setDebug(prev => [...prev, `Traitement image: ${imageUrl}`]);
            
            if (imageUrl) {
              if (!imageUrl.startsWith('http')) {
                const cleanPath = imageUrl.replace('public/lovable-uploads/', '');
                console.log('Chemin nettoyé:', cleanPath);
                setDebug(prev => [...prev, `Chemin nettoyé: ${cleanPath}`]);

                const { data: { publicUrl } } = supabase.storage
                  .from('space-images')
                  .getPublicUrl(cleanPath);
                
                imageUrl = publicUrl;
                console.log('URL publique générée:', publicUrl);
                setDebug(prev => [...prev, `URL publique: ${publicUrl}`]);
              }
            }

            return {
              ...cell,
              processedImageUrl: imageUrl
            };
          })
        );
        setProcessedCells(processed);
      } catch (error) {
        console.error('Erreur lors du traitement des images:', error);
        setDebug(prev => [...prev, `Erreur: ${error.message}`]);
      }
    };

    processImages();
  }, [ownedCells]);

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
    return processedCells.find(cell => 
      x >= cell.x &&
      x < cell.x + cell.width &&
      y >= cell.y &&
      y < cell.y + cell.height
    );
  };

  const handleCellClick = (x: number, y: number, ownedCell: ProcessedCell | undefined) => {
    if (ownedCell && ownedCell.link) {
      window.open(ownedCell.link, '_blank', 'noopener,noreferrer');
    } else {
      onCellClick(x, y);
    }
  };

  const renderOwnedCells = () => {
    return processedCells.map((cell) => (
      <div
        key={`owned-${cell.x}-${cell.y}`}
        className="absolute"
        style={{
          left: `${cell.x}%`,
          top: `${cell.y}%`,
          width: `${cell.width}%`,
          height: `${cell.height}%`,
          backgroundColor: '#ffffff',
          border: '1px solid rgba(26, 43, 60, 0.1)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => handleCellClick(cell.x, cell.y, cell)}
        title={cell.link}
      >
        {cell.processedImageUrl && (
          <>
            <img
              src={cell.processedImageUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
              onError={(e) => {
                console.error('Erreur de chargement de l\'image:', {
                  url: cell.processedImageUrl,
                  error: e
                });
                setDebug(prev => [...prev, `Erreur chargement image: ${cell.processedImageUrl}`]);
                e.currentTarget.src = '/placeholder.svg';
              }}
              onLoad={() => {
                console.log('Image chargée avec succès:', cell.processedImageUrl);
                setDebug(prev => [...prev, `Image chargée: ${cell.processedImageUrl}`]);
              }}
            />
          </>
        )}
      </div>
    ));
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
    <div className="space-y-4">
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
      
      {/* Debug panel */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <ul className="list-disc pl-4">
          {debug.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PixelGrid;