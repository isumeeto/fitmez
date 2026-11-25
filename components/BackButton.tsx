"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GlassSurface } from "./GlassSurface";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackUrl = "/",
  className = "",
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className={`touch-press active:scale-90 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] rounded-full ${className}`}
    >
      <GlassSurface
        pill
        className="w-11 h-11 flex items-center justify-center text-[var(--text)] shadow-xs"
      >
        <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
      </GlassSurface>
    </button>
  );
};
