"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { spring } from "@/lib/motion";
import { haptic } from "@/lib/haptics";

interface SheetBottomProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const SheetBottom: React.FC<SheetBottomProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      haptic.light();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          {/* Backdrop Dim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Thick Glass Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Bottom sheet"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring.snappy}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="glass relative w-full max-w-[430px] rounded-t-[28px] rounded-b-none p-5 max-h-[85vh] flex flex-col z-10 overflow-hidden shadow-[0_-12px_40px_rgba(2,26,38,0.7)]"
          >
            {/* Grab Handle */}
            <div className="w-full flex justify-center pb-3 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-[var(--text-subtle)] opacity-40" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="font-display font-bold text-lg text-[var(--text)] tracking-tight">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90"
                  aria-label="Close sheet"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Content with smooth scrolling */}
            <div className="overflow-y-auto no-scrollbar pt-3 flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
