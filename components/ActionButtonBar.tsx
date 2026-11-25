"use client";

import React from "react";
import { Heart, RefreshCw, MoreVertical } from "lucide-react";

export interface ActionButtonBarProps {
  isLiked: boolean;
  onLikeToggle: (e?: React.MouseEvent) => void;
  onRecreate: (e?: React.MouseEvent) => void;
  onMenuToggle: (e?: React.MouseEvent) => void;
  className?: string;
  compact?: boolean;
}

export function ActionButtonBar({
  isLiked,
  onLikeToggle,
  onRecreate,
  onMenuToggle,
  className = "",
  compact = false,
}: ActionButtonBarProps) {
  const sizeClasses = compact ? "w-8 h-8" : "w-10 h-10";
  const iconSize = compact ? 15 : 18;

  return (
    <div
      className={`absolute ${
        compact ? "bottom-2.5 right-2.5 gap-1.5" : "bottom-4 right-4 gap-2"
      } flex items-center z-30 ${className}`}
    >
      {/* Heart */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onLikeToggle(e);
        }}
        aria-label={isLiked ? "Unlike look" : "Like look"}
        className={`${sizeClasses} flex items-center justify-center rounded-full backdrop-blur-xl backdrop-saturate-180 border transition-all duration-200 active:scale-95 ${
          isLiked
            ? "bg-[#FF7A8A]/80 border-[#FF7A8A]/50"
            : "bg-white/15 border-white/20 hover:bg-white/25"
        }`}
      >
        <Heart size={iconSize} fill={isLiked ? "currentColor" : "none"} className="text-white" />
      </button>

      {/* Recreate */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRecreate(e);
        }}
        aria-label="Recreate this look"
        className={`${sizeClasses} flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl backdrop-saturate-180 transition-all duration-200 active:scale-95`}
      >
        <RefreshCw size={iconSize} />
      </button>

      {/* Three-Dot */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMenuToggle(e);
        }}
        aria-label="More options"
        className={`${sizeClasses} flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl backdrop-saturate-180 transition-all duration-200 active:scale-95`}
      >
        <MoreVertical size={iconSize} />
      </button>
    </div>
  );
}

export default ActionButtonBar;
