"use client";

import React from "react";
import { motion } from "motion/react";

export const PRESET_ORBS = [
  "ocean_drift",
  "midnight_tide",
  "sky_aurora",
  "deep_sea",
  "cyan_glow",
  "azure_mist",
  "frost_navy",
  "cobalt_haze",
];

interface AvatarProps {
  username?: string;
  seed?: string;
  gradient?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animateDrift?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-18 h-18",
  xl: "w-24 h-24",
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const Avatar: React.FC<AvatarProps> = ({
  username = "u/anon",
  seed,
  size = "md",
  animateDrift = false,
  className = "",
}) => {
  const effectiveSeed = seed || username;
  const hash = hashString(effectiveSeed);

  // Palettes within FITMEZ brand range: Matcha, Milk Honey, warm roasted cream, olive, golden matcha
  const colorSets = [
    { c1: "#161811", c2: "#9CA763", c3: "#303627" },
    { c1: "#24291E", c2: "#B5C17F", c3: "#161811" },
    { c1: "#3B4426", c2: "#F1E8C7", c3: "#161811" },
    { c1: "#2E3526", c2: "#9CA763", c3: "#E7DDB8" },
    { c1: "#1A1D14", c2: "#FAF5E4", c3: "#7F8A4B" },
    { c1: "#576140", c2: "#F1E8C7", c3: "#24291E" },
    { c1: "#161811", c2: "#B5C17F", c3: "#3B4426" },
    { c1: "#252A1E", c2: "#9CA763", c3: "#B5C17F" },
  ];

  const palette = colorSets[hash % colorSets.length];

  const orbContent = (
    <div
      className="relative w-full h-full rounded-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${palette.c2} 0%, ${palette.c1} 70%)`,
      }}
    >
      {/* Secondary blurred radial orb */}
      <div
        className="absolute w-[80%] h-[80%] -top-[10%] -right-[10%] rounded-full blur-[8px] opacity-80"
        style={{ background: palette.c3 }}
      />
      {/* Specular highlight orb */}
      <div
        className="absolute w-[60%] h-[60%] -bottom-[10%] -left-[10%] rounded-full blur-[10px] opacity-75"
        style={{ background: palette.c2 }}
      />
      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );

  return (
    <div
      className={`rounded-full shrink-0 select-none relative p-[1.5px] border border-[var(--border)] overflow-hidden shadow-xs ${SIZE_MAP[size]} ${className}`}
      aria-label={`Avatar for ${username}`}
    >
      {animateDrift ? (
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.06, 0.96, 1],
          }}
          transition={{
            type: "tween",
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full"
        >
          {orbContent}
        </motion.div>
      ) : (
        orbContent
      )}
    </div>
  );
};
