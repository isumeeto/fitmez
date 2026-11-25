"use client";

import React, { useMemo } from "react";
import { Item, ClothingType } from "@/lib/types";
import { PaletteRing } from "./PaletteRing";
import { Shirt, Footprints, Layers } from "lucide-react";
import { SWATCH_COLORS } from "./ColorSwatchRow";

interface ClosetStatsProps {
  items: Item[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const ClosetStats: React.FC<ClosetStatsProps> = ({
  items,
  activeCategory = "all",
  onSelectCategory,
}) => {
  const stats = useMemo(() => {
    const total = items.length;
    const typeCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};

    items.forEach((item) => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      const c = item.color.toLowerCase();
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    });

    const uniqueColors = Object.keys(colorCounts).length;

    let mostCommonType = "None";
    let highestCount = 0;
    Object.entries(typeCounts).forEach(([t, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostCommonType = t;
      }
    });

    // Color distribution for the ring
    const colorData = Object.entries(colorCounts).map(([color, count]) => {
      const match = SWATCH_COLORS.find((sw) => sw.name === color);
      return {
        color,
        count,
        hex: match ? match.hex : "#9CA763",
      };
    });

    return {
      total,
      uniqueColors,
      mostCommonType,
      typeCounts,
      colorData,
    };
  }, [items]);

  const categories = [
    { id: "all", label: "All", count: stats.total },
    { id: "shirt", label: "Tops", count: stats.typeCounts["shirt"] || 0 },
    { id: "pants", label: "Pants", count: stats.typeCounts["pants"] || 0 },
    { id: "jacket", label: "Outerwear", count: stats.typeCounts["jacket"] || 0 },
    { id: "shoes", label: "Shoes", count: stats.typeCounts["shoes"] || 0 },
    { id: "accessory", label: "Accessories", count: stats.typeCounts["accessory"] || 0 },
  ];

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* Top Stat Strip with Palette Ring */}
      <div className="w-full p-4 rounded-[28px] bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-between gap-4">
        {/* Left: Summary Metrics */}
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Digital Wardrobe
            </span>
            <h3 className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight">
              Closet Dynamics
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border)]">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Distinct Colors</p>
              <p className="font-display font-bold text-sm text-[var(--text)]">
                {stats.uniqueColors} shades
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Primary Anchor</p>
              <p className="font-display font-bold text-sm text-[var(--accent)] capitalize">
                {stats.mostCommonType}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Palette Ring */}
        <PaletteRing colorData={stats.colorData} totalItems={stats.total} />
      </div>

      {/* Horizontal Category Rails */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory?.(cat.id)}
              className={`shrink-0 px-3.5 py-2 rounded-2xl flex items-center gap-2 border transition-all text-xs font-semibold select-none ${
                isSelected
                  ? "bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--accent-line)] shadow-xs"
                  : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? "bg-[var(--accent)] text-[var(--on-accent)]"
                    : "bg-white/5 text-[var(--text-subtle)]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
