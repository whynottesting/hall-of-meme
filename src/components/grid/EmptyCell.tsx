import React from 'react';
import { cn } from "@/lib/utils";

interface EmptyCellProps {
  x: number;
  y: number;
  isSelected: boolean;
  onClick: (x: number, y: number) => void;
}

const EmptyCell: React.FC<EmptyCellProps> = ({ x, y, isSelected, onClick }) => {
  return (
    <div
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
        isSelected && "bg-blue-100",
        "hover:bg-gray-100"
      )}
      onClick={() => onClick(x, y)}
    />
  );
};

export default EmptyCell;