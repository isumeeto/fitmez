"use client";

import React, { useState, useEffect } from "react";
import { Award, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { ALL_BADGES, getUnlockedBadges } from "@/lib/badges";

export const BadgeGrid: React.FC = () => {
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});

  useEffect(() => {
    setUnlocked(getUnlockedBadges());
  }, []);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="font-display font-bold text-sm text-[var(--text)] tracking-tight">
          Style Achievements
        </h4>
        <span className="text-[11px] font-semibold text-[var(--accent)]">
          {Object.keys(unlocked).length} / {ALL_BADGES.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ALL_BADGES.map((badge) => {
          const isUnlocked = Boolean(unlocked[badge.id]);

          return (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                isUnlocked
                  ? "bg-[var(--surface-2)] border-[var(--accent-line)] shadow-sm"
                  : "bg-[var(--surface)] border-[var(--border)] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isUnlocked
                      ? "bg-[var(--accent-tint)] text-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]"
                      : "bg-white/5 text-[var(--text-subtle)]"
                  }`}
                >
                  {isUnlocked ? (
                    <Award className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  )}
                </div>
                {isUnlocked && (
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--text)] tracking-tight">
                  {badge.label}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-tight mt-0.5">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
