import React from 'react';

interface OwnedCellProps {
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  link: string;
  onClick: () => void;
}

const OwnedCell: React.FC<OwnedCellProps> = ({
  x,
  y,
  width,
  height,
  imageUrl,
  link,
  onClick
}) => {
  console.log("🎯 Rendu OwnedCell:", { x, y, width, height, imageUrl, link });
  
  return (
    <div
      className="absolute cursor-pointer"
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
            console.error('Erreur de chargement de l\'image:', imageUrl);
            e.currentTarget.src = '/placeholder.svg';
          }}
          onLoad={() => {
            console.log('Image chargée avec succès:', imageUrl);
          }}
        />
      )}
    </div>
  );
};

export default OwnedCell;