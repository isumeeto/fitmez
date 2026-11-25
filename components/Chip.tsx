"use client";

import React from "react";
import { motion } from "motion/react";
import { spring, keyframeTransition } from "@/lib/motion";
import { haptic } from "@/lib/haptics";

export { ChipRow } from "./ChipRow";

interface ChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
  count?: number;
}

export const Chip: React.FC<ChipProps> = React.memo(function Chip({
  label,
  isActive = false,
  onClick,
  className = "",
  size = "md",
  count,
}) {
  const handleClick = () => {
    haptic.light();
    onClick?.();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={false}
      animate={{
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      whileTap={{ scale: 0.96 }}
      className={`shrink-0 rounded-full font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] select-none ${
        size === "sm"
          ? "px-3 py-1 text-xs min-h-[34px]"
          : "px-4 py-2 text-xs min-h-[40px]"
      } ${
        isActive
          ? "bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] shadow-xs font-semibold"
          : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
      } ${className}`}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            isActive
              ? "bg-[var(--accent)] text-[var(--on-accent)]"
              : "bg-white/5 text-[var(--text-subtle)]"
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
});
