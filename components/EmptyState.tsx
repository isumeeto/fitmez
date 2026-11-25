import React from "react";
import { Sparkles } from "lucide-react";
import { Pressable } from "./Pressable";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] mb-3 border border-[var(--border)]">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="font-display font-bold text-base text-[var(--text)] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Pressable
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-semibold shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)]"
        >
          {actionLabel}
        </Pressable>
      )}
    </div>
  );
};
