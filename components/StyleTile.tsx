"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { haptic } from "@/lib/haptics";

interface StyleTileProps {
  label: string;
  image: string;
  isSelected?: boolean;
  onClick: () => void;
}

export const StyleTile: React.FC<StyleTileProps> = ({
  label,
  image,
  isSelected = false,
  onClick,
}) => {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        haptic.light();
        onClick();
      }}
      className={`group relative w-full aspect-[4/3] rounded-2xl overflow-hidden border text-left focus:outline-none transition-all shadow-xs ${
        isSelected
          ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
          : "border-[var(--border)]"
      }`}
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="(max-width: 640px) 50vw, 200px"
        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Scrim Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/35 to-transparent" />

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between">
        <span className="font-display font-bold text-xs text-[var(--text)] tracking-tight">
          {label}
        </span>
        {isSelected && (
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        )}
      </div>
    </motion.button>
  );
};
