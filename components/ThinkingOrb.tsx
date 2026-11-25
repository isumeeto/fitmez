"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface ThinkingOrbProps {
  phrases?: string[];
  className?: string;
}

export const ThinkingOrb: React.FC<ThinkingOrbProps> = ({
  phrases = [
    "Checking your colors…",
    "Matching your fits…",
    "Balancing proportions…",
    "Finalizing styling…",
  ],
  className = "",
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
      {/* Pulsing Thinking Orb */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.25, 0.95, 1],
            opacity: [0.35, 0.75, 0.45, 0.35],
          }}
          transition={{
            type: "tween",
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] blur-md"
        />
        <motion.div
          animate={{
            rotate: 360,
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { type: "tween", duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="w-12 h-12 rounded-full border border-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--surface-2), var(--surface))",
          }}
        >
          <div className="w-4 h-4 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
        </motion.div>
      </div>

      {/* Rotating Microcopy */}
      <motion.p
        key={phraseIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="text-xs font-semibold text-[var(--accent)] tracking-tight text-center"
      >
        {phrases[phraseIndex]}
      </motion.p>
    </div>
  );
};
