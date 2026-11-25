"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
}) => {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const canPull = useRef(false);
  const hasVibrated = useRef(false);

  const THRESHOLD = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      canPull.current = true;
      hasVibrated.current = false;
    } else {
      canPull.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canPull.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Rubber band easing
      const eased = Math.min(100, Math.pow(diff, 0.82));
      setPullY(eased);

      if (eased >= THRESHOLD && !hasVibrated.current) {
        haptic.light();
        hasVibrated.current = true;
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!canPull.current || isRefreshing) return;
    canPull.current = false;

    if (pullY >= THRESHOLD) {
      setIsRefreshing(true);
      setPullY(THRESHOLD);
      haptic.medium();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full [overscroll-behavior-y:contain]"
    >
      {/* Pull Indicator */}
      <div
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-150 pointer-events-none"
        style={{
          height: `${pullY}px`,
          opacity: pullY > 10 ? Math.min(1, pullY / THRESHOLD) : 0,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-md">
          <Sparkles
            className={`w-5 h-5 transition-transform duration-200 ${
              isRefreshing ? "animate-spin" : ""
            }`}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${(pullY / THRESHOLD) * 360}deg)`,
            }}
          />
        </div>
      </div>

      {children}
    </div>
  );
};
