"use client";

import React from "react";

export interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "danger";
  textColor?: string;
  className?: string;
}

export function MenuItem({ 
  icon, 
  label, 
  onClick, 
  variant = "default",
  textColor = "text-[#1a1a1a]",
  className = "",
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 ease-out
        flex items-center justify-center gap-2
        active:scale-95
        ${variant === "danger"
          ? "text-[#dc2626] hover:bg-red-500/10"
          : `${textColor} hover:bg-black/10`
        }
        ${className}
      `}
    >
      <span className="text-lg flex items-center justify-center shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default MenuItem;
