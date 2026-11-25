"use client";

import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getStreak } from "@/lib/badges";

interface StreakChipProps {
  className?: string;
  count?: number;
}

export const StreakChip: React.FC<StreakChipProps> = ({ className = "", count }) => {
  const [streakCount, setStreakCount] = useState(count ?? 3);

  useEffect(() => {
    if (count !== undefined) {
      setStreakCount(count);
      return;
    }
    const s = getStreak();
    setStreakCount(s.count);
  }, [count]);

  return (
    <div
      className={`px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-1.5 shadow-xs ${className}`}
      aria-label={`${streakCount} day fit streak`}
    >
      <Flame className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] drop-shadow-[0_0_8px_rgba(255,149,0,0.6)]" />
      <span className="text-xs font-bold text-[var(--text)] tracking-tight">
        {streakCount}d
      </span>
      <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
        streak
      </span>
    </div>
  );
};
