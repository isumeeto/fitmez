"use client";

import React from "react";
import { motion } from "motion/react";

interface ScanOverlayProps {
  isScanning: boolean;
  className?: string;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  isScanning,
  className = "",
}) => {
  if (!isScanning) return null;

  return (
    <div className={`absolute inset-0 z-20 pointer-events-none overflow-hidden ${className}`}>
      {/* Corner Brackets */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)]" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)]" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)]" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)]" />

      {/* Sweeping Laser Scan Line */}
      <motion.div
        animate={{ y: ["0%", "100%", "0%"] }}
        transition={{ type: "tween", duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="w-full h-1 bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] shadow-[0_0_16px_var(--accent-glow)]"
      />

      {/* Subdued Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(176,237,249,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
};
