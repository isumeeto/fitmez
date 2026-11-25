"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  initialRating?: number;
  maxStars?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  maxStars = 5,
  onRate,
  readOnly = false,
  size = "md",
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    onRate?.(value);
  };

  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rate outfit">
      {Array.from({ length: maxStars }).map((_, index) => {
        const value = index + 1;
        const isFilled = value <= (hoverRating || rating);

        return (
          <button
            key={value}
            type="button"
            role="radio"
            disabled={readOnly}
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readOnly && setHoverRating(value)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            aria-label={`${value} out of ${maxStars} stars`}
            aria-checked={value === rating}
            className={`touch-press focus:outline-none transition-transform ${
              !readOnly ? "hover:scale-110 active:scale-95 cursor-pointer" : "cursor-default"
            }`}
          >
            <Star
              className={`${SIZE_MAP[size]} transition-colors duration-150 ${
                isFilled
                  ? "fill-[var(--accent)] text-[var(--accent)] drop-shadow-[0_2px_8px_var(--accent-glow)]"
                  : "text-[var(--text-subtle)] stroke-[1.75]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
