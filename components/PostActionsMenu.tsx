"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "motion/react";
import { Heart, Bookmark, Sparkles, Share2, Flag } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface PostActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onLike: () => void;
  onSave: () => void;
  onRecreate: () => void;
  onShare: () => void;
  onReport: () => void;
}

// Spring popover: fade + 16px slide-up, tension≈70 / friction≈10
const menuSpring: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 20,
  mass: 0.8,
};

const exitEase = [0.4, 0, 1, 1] as [number, number, number, number];
const itemEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const PostActionsMenu: React.FC<PostActionsMenuProps> = ({
  isOpen,
  onClose,
  isLiked,
  onLike,
  onSave,
  onRecreate,
  onShare,
  onReport,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const menuItems = [
    {
      icon: Heart,
      label: isLiked ? "Unlike Look" : "Like Look",
      action: () => { haptic.light(); onLike(); onClose(); },
      accent: isLiked,
      iconClass: isLiked
        ? "fill-[var(--like)] stroke-[var(--like)] text-[var(--like)]"
        : "stroke-[var(--text-muted)]",
    },
    {
      icon: Bookmark,
      label: "Save to Collection",
      action: () => { haptic.light(); onSave(); onClose(); },
      accent: false,
      iconClass: "stroke-[var(--text-muted)]",
    },
    {
      icon: Sparkles,
      label: "Recreate This Look",
      action: () => { haptic.medium(); onRecreate(); onClose(); },
      accent: true,
      iconClass: "stroke-[var(--accent)] text-[var(--accent)]",
    },
    {
      icon: Share2,
      label: "Share",
      action: () => { haptic.light(); onShare(); onClose(); },
      accent: false,
      iconClass: "stroke-[var(--text-muted)]",
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-visible"
          role="dialog"
          aria-modal="true"
          aria-label="Post actions"
        >
          {/* Subtle backdrop — tap to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Glass Pill Popover — slides up from bottom */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: menuSpring }}
            exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.18, ease: exitEase } }}
            className="relative z-10 w-full max-w-[320px] max-h-[90vh] overflow-y-auto mb-24 sm:mb-28 mx-4 overflow-visible no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glass pill container */}
            <div
              className="glass rounded-2xl overflow-visible border border-[var(--border-strong)] shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(var(--glass-rgb), 0.82), rgba(var(--glass-rgb), 0.68))",
              }}
            >
              {/* Main actions */}
              <div className="flex flex-col p-2 gap-0.5">
                {menuItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      type="button"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: i * 0.035, duration: 0.2, ease: itemEase },
                      }}
                      onClick={item.action}
                      className={`group w-full px-4 py-3.5 rounded-xl flex items-center gap-3.5 text-sm font-semibold transition-colors duration-100 text-left
                        hover:bg-[var(--accent-tint)] active:scale-[0.98]
                        ${item.accent && item.label !== "Like Look" && item.label !== "Unlike Look"
                          ? "text-[var(--accent)]"
                          : "text-[var(--text)]"
                        }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110 ${item.iconClass}`}
                      />
                      <span className="tracking-tight whitespace-nowrap overflow-visible">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-[var(--border-strong)] opacity-60" />

              {/* Report — danger zone */}
              <div className="p-2">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: menuItems.length * 0.035, duration: 0.2, ease: itemEase },
                  }}
                  onClick={() => { haptic.light(); onReport(); onClose(); }}
                  className="group w-full px-4 py-3.5 rounded-xl flex items-center gap-3.5 text-sm font-medium text-[var(--danger)] hover:bg-red-500/8 active:scale-[0.98] transition-colors duration-100 text-left"
                >
                  <Flag
                    className="w-[18px] h-[18px] shrink-0 stroke-[var(--danger)] transition-transform duration-150 group-hover:scale-110"
                  />
                  <span className="tracking-tight whitespace-nowrap overflow-visible">Report</span>
                </motion.button>
              </div>
            </div>

            {/* Cancel pill — iOS-style */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.22, ease: itemEase } }}
              exit={{ opacity: 0, y: 4 }}
              onClick={onClose}
              className="mt-2 w-full glass rounded-full py-3.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface)] active:scale-[0.98] transition-colors border border-[var(--border-strong)]"
            >
              Cancel
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
