import React from "react";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "2xl" | "3xl" | "full";
}

const ROUNDED_MAP = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  rounded = "2xl",
}) => {
  return (
    <div
      className={`skeleton-shimmer border border-[var(--border)] ${ROUNDED_MAP[rounded]} ${className}`}
    />
  );
};

export const PostCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  const heightClasses = ["h-56", "h-72", "h-64", "h-80"];
  const hClass = heightClasses[index % heightClasses.length];

  return (
    <div className="flex flex-col gap-2">
      <Skeleton className={`w-full ${hClass}`} rounded="3xl" />
      <div className="flex items-center justify-between px-2">
        <Skeleton className="w-20 h-3" rounded="full" />
        <Skeleton className="w-8 h-3" rounded="full" />
      </div>
    </div>
  );
};

export const ItemCardSkeleton: React.FC = () => {
  return (
    <div className="p-2.5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-2">
      <Skeleton className="w-full aspect-square" rounded="2xl" />
      <div className="space-y-1.5 px-1">
        <Skeleton className="w-16 h-3" rounded="full" />
        <Skeleton className="w-10 h-2.5" rounded="full" />
      </div>
    </div>
  );
};
