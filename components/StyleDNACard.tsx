"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Share2, Sparkles, Award } from "lucide-react";
import { Pressable } from "./Pressable";
import { APP_NAME } from "@/lib/constants";
import { unlockBadge } from "@/lib/badges";
import { useToast } from "./Toast";
import { MOCK_WARDROBE_ITEMS } from "@/lib/mock/data";

interface StyleDNACardProps {
  username?: string;
  vibes?: string[];
}

export const StyleDNACard: React.FC<StyleDNACardProps> = ({
  username = "u/capsule_curator",
  vibes = ["Minimal", "Old money", "Smart casual"],
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Derive archetype label from vibes
  const archetype =
    vibes.includes("Old money") || vibes.includes("Minimal")
      ? "Quiet Luxury & Architectural"
      : vibes.includes("Streetwear")
      ? "Modern Street Draping"
      : "Effortless Contemporary";

  const paletteColors = ["#9CA763", "#F1E8C7", "#24291E", "#B5C17F", "#FAF5E4"];

  const handleShare = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    showToast("Generating Style DNA export…");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });

      unlockBadge("style_dna_shared");

      // Attempt web share with file or fallback download
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "style_dna.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${username} Style DNA`,
          text: `Check out my Style DNA on ${APP_NAME}!`,
        });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `style_dna_${username.replace("u/", "")}.png`;
        a.click();
        showToast("Style DNA downloaded!");
      }
    } catch (err) {
      console.error(err);
      showToast("Unable to export image on this device.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        ref={cardRef}
        className="ai-gradient-border relative w-full p-4.5 rounded-[28px] bg-[var(--surface)] shadow-lg flex flex-col gap-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-line)] flex items-center justify-center text-[var(--accent)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                Personal Style DNA
              </p>
              <h3 className="font-display font-extrabold text-base text-[var(--text)] tracking-tight">
                {archetype}
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-[var(--text-subtle)]">
            {username}
          </span>
        </div>

        {/* Top 3 Vibes */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Dominant Aesthetics
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {vibes.slice(0, 3).map((vibe, idx) => (
              <span
                key={vibe}
                className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
              >
                #{idx + 1} {vibe}
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Closet Harmony Bar</span>
            <span className="text-[var(--accent)]">94% Cohesion</span>
          </div>
          <div className="w-full h-3.5 rounded-full overflow-hidden flex border border-[var(--border)] shadow-inner">
            {paletteColors.map((col, i) => (
              <div
                key={i}
                className="h-full flex-1 transition-all"
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </div>

        {/* Most Worn Pieces */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Signature Pieces
          </span>
          <div className="grid grid-cols-3 gap-2">
            {MOCK_WARDROBE_ITEMS.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2"
              >
                <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-[var(--surface)] shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.type}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold text-[var(--text)] capitalize truncate">
                    {item.type}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] capitalize truncate">
                    {item.color}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watermark for export */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[10px] font-semibold text-[var(--text-subtle)]">
          <span className="flex items-center gap-1.5">
            <span className="font-brand tracking-[0.14em] uppercase text-xs text-[var(--text)]">{APP_NAME}</span>
            <span>— MIW AI Stylist</span>
          </span>
          <span>fitmez.app</span>
        </div>
      </div>

      {/* Share Export Button */}
      <Pressable
        type="button"
        onClick={handleShare}
        disabled={isExporting}
        className="w-full py-2.5 px-4 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] flex items-center justify-center gap-2 text-xs font-bold shadow-xs hover:brightness-105 active:scale-98 transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span>{isExporting ? "Exporting…" : "Share Style DNA Card"}</span>
      </Pressable>
    </div>
  );
};
