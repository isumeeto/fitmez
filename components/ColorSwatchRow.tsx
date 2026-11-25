"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { haptic } from "@/lib/haptics";

// Premium fashion-forward palette — curated, not utilitarian
export const SWATCH_COLORS = [
  { name: "black",      hex: "#0D0D0D", border: "#333333", label: "Black" },
  { name: "white",      hex: "#FAFAF8", border: "#DDDDD5", label: "White" },
  { name: "cream",      hex: "#F1E8C7", border: "#C4B99A", label: "Cream" },
  { name: "matcha",     hex: "#9CA763", border: "#7B8746", label: "Matcha" },
  { name: "navy",       hex: "#1C2A39", border: "#34495E", label: "Navy" },
  { name: "olive",      hex: "#556B2F", border: "#738C45", label: "Olive" },
  { name: "terracotta", hex: "#C96A3B", border: "#A8512B", label: "Terracotta" },
  { name: "coral",      hex: "#E8705A", border: "#CC5B45", label: "Coral" },
  { name: "pink",       hex: "#ECA1B5", border: "#D4789A", label: "Pink" },
  { name: "brown",      hex: "#6E473B", border: "#8C5E50", label: "Brown" },
  { name: "grey",       hex: "#8A8E85", border: "#6E7268", label: "Grey" },
  { name: "green",      hex: "#2F855A", border: "#48BB78", label: "Green" },
  { name: "purple",     hex: "#6B46C1", border: "#9F7AEA", label: "Lavender" },
  { name: "blue",       hex: "#3182CE", border: "#63B3ED", label: "Blue" },
];

interface ColorSwatchRowProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

export const ColorSwatchRow: React.FC<ColorSwatchRowProps> = ({
  selectedColors,
  onChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleColor = (name: string) => {
    haptic.light();
    if (selectedColors.includes(name)) {
      onChange(selectedColors.filter((c) => c !== name));
    } else {
      onChange([...selectedColors, name]);
    }
  };

  const clearAll = () => {
    haptic.light();
    onChange([]);
  };

  const activeCount = selectedColors.length;

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-subtle)]">
            Color
          </span>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                key="count"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[var(--accent)] text-[var(--on-accent)] text-[10px] font-black leading-none"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              type="button"
              onClick={clearAll}
              className="text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-soft)] active:opacity-60 transition-colors"
            >
              Clear all
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Swatch scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {SWATCH_COLORS.map((c) => {
          const isSelected = selectedColors.includes(c.name);
          // Determine if the swatch is light (needs dark check icon)
          const isLight =
            c.name === "white" ||
            c.name === "cream" ||
            c.name === "pink" ||
            c.name === "coral";

          return (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleColor(c.name)}
              aria-label={`Filter by ${c.label}`}
              aria-pressed={isSelected}
              className="relative shrink-0 flex flex-col items-center gap-1.5 focus:outline-none select-none group"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Swatch square */}
              <motion.div
                animate={{
                  scale: isSelected ? 1.08 : 1,
                  boxShadow: isSelected
                    ? `0 0 0 2px var(--accent), 0 0 12px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.2)`
                    : `0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                className="w-[26px] h-[26px] rounded-[7px] relative overflow-hidden"
                style={{
                  backgroundColor: c.hex,
                  border: `1.5px solid ${c.border}`,
                }}
              >
                {/* Selected checkmark overlay */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 4.5L4.5 8L11 1.5"
                          stroke={isLight ? "#1C2312" : "#FFFFFF"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Label below swatch */}
              <span
                className={`text-[8px] font-semibold leading-none tracking-tight transition-colors duration-150 ${
                  isSelected
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-subtle)] group-hover:text-[var(--text-muted)]"
                }`}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
