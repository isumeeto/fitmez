"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X, Award } from "lucide-react";
import { spring } from "@/lib/motion";
import { haptic } from "@/lib/haptics";
import { ALL_BADGES } from "@/lib/badges";

type ToastType = "success" | "error" | "info" | "badge";

interface ToastMessage {
  id: string;
  text: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: ToastType = "success") => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);

    if (type === "success" || type === "badge") {
      haptic.success();
    } else {
      haptic.light();
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const handleBadgeUnlocked = (e: Event) => {
      const custom = e as CustomEvent<{ badgeId: string }>;
      const badge = ALL_BADGES.find((b) => b.id === custom.detail.badgeId);
      if (badge) {
        showToast(`🏆 Badge Unlocked: ${badge.label}!`, "badge");
      }
    };

    window.addEventListener("dripcheck_badge_unlocked", handleBadgeUnlocked);
    return () => window.removeEventListener("dripcheck_badge_unlocked", handleBadgeUnlocked);
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container: bottom-centered above the floating bottom nav */}
      <div className="fixed bottom-24 left-0 right-0 max-w-[430px] mx-auto px-4 z-50 pointer-events-none flex flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon =
              toast.type === "error"
                ? AlertCircle
                : toast.type === "info"
                ? Info
                : toast.type === "badge"
                ? Award
                : CheckCircle2;

            const iconColor =
              toast.type === "error"
                ? "text-[var(--danger)]"
                : toast.type === "info"
                ? "text-[var(--accent-soft)]"
                : toast.type === "badge"
                ? "text-[var(--accent)]"
                : "text-[var(--success)]";

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={spring.snappy}
                className="glass pointer-events-auto px-4 py-2.5 flex items-center gap-2.5 shadow-xl border border-[var(--border)] rounded-full"
              >
                <Icon className={`w-4 h-4 shrink-0 stroke-[2] ${iconColor}`} />
                <span className="text-xs font-semibold text-[var(--text)] tracking-tight">
                  {toast.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-[var(--text-subtle)] hover:text-[var(--text)] ml-1 focus:outline-none"
                  aria-label="Dismiss toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
