"use client";

import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

interface HeartBurstProps {
  x?: number;
  y?: number;
  onComplete?: () => void;
}

export const HeartBurst: React.FC<HeartBurstProps> = ({ x, y, onComplete }) => {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    const distance = 36;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  return (
    <div
      className="absolute pointer-events-none z-30 flex items-center justify-center"
      style={
        x !== undefined && y !== undefined
          ? { left: x, top: y, transform: "translate(-50%, -50%)" }
          : { inset: 0, margin: "auto" }
      }
    >
      {/* Central bouncing heart */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.35, 1], opacity: [0, 1, 0] }}
        transition={{ type: "tween", duration: 0.65, ease: [0.22, 1, 0.36, 1], times: [0, 0.6, 1] }}
        onAnimationComplete={onComplete}
        className="text-[var(--like)]"
      >
        <Heart className="w-14 h-14 fill-[var(--like)] stroke-[var(--like)] drop-shadow-[0_4px_16px_rgba(255,122,138,0.6)]" />
      </motion.div>

      {/* 8 Radial Burst Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ x: 0, y: 0, scale: 0.8, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full bg-[var(--like)] shadow-[0_0_8px_var(--like)]"
        />
      ))}
    </div>
  );
};
