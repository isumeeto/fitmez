"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Lock, Sparkles, X, Trophy } from "lucide-react";
import { ALL_BADGES } from "@/lib/badges";
import { haptic } from "@/lib/haptics";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadges: Record<string, string>;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  unlockedBadges,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const unlockedCount = Object.keys(unlockedBadges).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievements-title"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[410px] max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] bg-[var(--surface)]/90 backdrop-blur-2xl p-5 flex flex-col gap-4 border border-[var(--border-strong)] shadow-2xl overflow-hidden z-10 mx-auto"
          >
            {/* Grab handle for mobile feel */}
            <div className="w-10 h-1 rounded-full bg-[var(--text-subtle)]/30 mx-auto -mt-1 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xs">
                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400/20 stroke-[2]" />
                </div>
                <div>
                  <h2
                    id="achievements-title"
                    className="font-display font-extrabold text-base text-[var(--text)] tracking-tight leading-none"
                  >
                    Style Achievements
                  </h2>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                      {unlockedCount} / {ALL_BADGES.length} Unlocked
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  onClose();
                }}
                aria-label="Close achievements"
                className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* 2-Column Grid of all 6 Achievement Cards */}
            <div className="overflow-y-auto no-scrollbar py-1">
              <div className="grid grid-cols-2 gap-2.5">
                {ALL_BADGES.map((badge) => {
                  const isUnlocked = Boolean(unlockedBadges[badge.id]);

                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 relative overflow-hidden ${
                        isUnlocked
                          ? "bg-[var(--surface-2)] border-amber-400/30 shadow-xs"
                          : "bg-[var(--surface-2)]/30 border-[var(--border)] opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isUnlocked
                              ? "bg-amber-400/15 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                              : "bg-black/10 dark:bg-white/5 text-[var(--text-subtle)]"
                          }`}
                        >
                          {isUnlocked ? (
                            <Award className="w-4 h-4 stroke-[2]" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 stroke-[1.75]" />
                          )}
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${
                            isUnlocked
                              ? "bg-amber-400/15 text-amber-400 border border-amber-400/25"
                              : "bg-[var(--surface)] text-[var(--text-subtle)] border border-[var(--border)]"
                          }`}
                        >
                          {isUnlocked ? "Unlocked" : "Locked"}
                        </span>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
