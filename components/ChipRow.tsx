import React from "react";

interface ChipRowProps {
  children: React.ReactNode;
  className?: string;
}

export const ChipRow: React.FC<ChipRowProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-4 -mx-4 ${className}`}
    >
      {children}
    </div>
  );
};
