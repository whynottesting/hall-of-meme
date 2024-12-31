import React from 'react';
import { Upload } from 'lucide-react';

interface OwnedCellProps {
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  link: string;
  onClick: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const OwnedCell: React.FC<OwnedCellProps> = ({
  x,
  y,
  width,
  height,
  imageUrl,
  link,
  onClick,
  onImageUpload
}) => {
  console.log("🎯 Rendu OwnedCell:", { x, y, width, height, imageUrl });
  
  return (
    <div
      className="absolute cursor-pointer group"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(26, 43, 60, 0.1)',
        overflow: 'hidden',
      }}
      onClick={onClick}
      title={link}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
          onError={(e) => {
            console.error('❌ Erreur de chargement de l\'image:', imageUrl);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('✅ Image chargée avec succès:', imageUrl);
          }}
        />
      )}
      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          onClick={(e) => e.stopPropagation()}
        />
        <Upload className="w-6 h-6 text-white" />
      </label>
    </div>
  );
};

export default OwnedCell;