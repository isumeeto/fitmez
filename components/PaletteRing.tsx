"use client";

import React from "react";
import { motion } from "motion/react";

interface ColorCount {
  color: string;
  count: number;
  hex: string;
}

interface PaletteRingProps {
  colorData: ColorCount[];
  totalItems: number;
}

export const PaletteRing: React.FC<PaletteRingProps> = ({
  colorData,
  totalItems,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
        {/* Track background */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="var(--border)"
          strokeWidth="10"
          fill="none"
        />

        {colorData.map((item, idx) => {
          const percent = totalItems > 0 ? item.count / totalItems : 0;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;

          return (
            <motion.circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              stroke={item.hex}
              strokeWidth="10"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, delay: idx * 0.1, ease: "easeOut" }}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-base text-[var(--text)] tracking-tight">
          {totalItems}
        </span>
        <span className="text-[9px] uppercase font-bold text-[var(--text-subtle)] tracking-wider">
          Pieces
        </span>
      </div>
    </div>
  );
};
