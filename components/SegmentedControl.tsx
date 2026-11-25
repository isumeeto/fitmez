"use client";

import React from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/motion";
import { haptic } from "@/lib/haptics";

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`relative flex items-center p-1 rounded-full bg-[var(--surface)] border border-[var(--border)] select-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.id === value;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => {
              if (!isSelected) {
                haptic.light();
                onChange(option.id);
              }
            }}
            className={`relative flex-1 flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 z-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] ${
              size === "sm" ? "py-1.5 text-xs" : "py-2.5 text-sm"
            } ${
              isSelected
                ? "text-[var(--accent)] font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {/* Sliding Pill Indicator */}
            {isSelected && (
              <motion.div
                layoutId="segmented-pill"
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-line)] shadow-xs -z-10"
              />
            )}

            {Icon && <Icon className="w-4 h-4 stroke-[1.75]" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
