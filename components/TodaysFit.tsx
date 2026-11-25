"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, Check, ArrowRight } from "lucide-react";
import { Pressable } from "./Pressable";
import { StreakChip } from "./StreakChip";
import { recommendOutfit, getItems } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { recordStreakActivity } from "@/lib/badges";
import { useToast } from "./Toast";
import { MOCK_WARDROBE_ITEMS } from "@/lib/mock/data";
import { Item, Occasion } from "@/lib/types";

export const TodaysFit: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [occasion, setOccasion] = useState<Occasion>("casual");
  const [wardrobe, setWardrobe] = useState<Item[]>([]);
  const [outfitItems, setOutfitItems] = useState<Item[]>([]);
  const [outfitId, setOutfitId] = useState<string>("fit-today-01");
  const [explanation, setExplanation] = useState<string>(
    "Balanced navy and cream layers with clean minimal footwear for an effortless silhouette."
  );
  const [loading, setLoading] = useState(true);
  const [isWorn, setIsWorn] = useState(false);

  const occasions: Occasion[] = ["casual", "office", "date", "party"];

  useEffect(() => {
    let active = true;
    const userId = getUserId();

    async function loadWardrobeAndFit() {
      setLoading(true);
      try {
        const items = await getItems(userId);
        if (active) {
          const validItems = items.length > 0 ? items : MOCK_WARDROBE_ITEMS;
          setWardrobe(validItems);

          // Check sessionStorage cache for today & occasion
          const cacheKey = `dripcheck_fit_${new Date().toDateString()}_${occasion}`;
          const cached = sessionStorage.getItem(cacheKey);

          if (cached) {
            const data = JSON.parse(cached);
            setOutfitId(data.outfit_id);
            setExplanation(data.explanation);
            setOutfitItems(data.items);
          } else {
            const res = await recommendOutfit(userId, occasion);
            // Match items with images from wardrobe
            const matchedPieces = res.items
              .map((rec) => validItems.find((w) => w.id === rec.id) || validItems.find((w) => w.type === rec.type))
              .filter(Boolean) as Item[];

            const finalPieces =
              matchedPieces.length >= 2 ? matchedPieces : validItems.slice(0, 3);

            setOutfitId(res.outfit_id);
            setExplanation(res.explanation);
            setOutfitItems(finalPieces);

            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                outfit_id: res.outfit_id,
                explanation: res.explanation,
                items: finalPieces,
              })
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWardrobeAndFit();
    return () => {
      active = false;
    };
  }, [occasion]);

  const handleShuffle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const shuffled = [...wardrobe].sort(() => 0.5 - Math.random()).slice(0, 3);
    setOutfitItems(shuffled);
    setExplanation(
      `Fresh ${occasion} combination focusing on tonal textures and refined ease.`
    );
    setLoading(false);
  };

  const handleWearThis = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWorn(true);
    recordStreakActivity();
    showToast("Fit logged! Streak updated 🔥");
  };

  const todayGreeting = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  if (wardrobe.length > 0 && wardrobe.length < 3) {
    return (
      <div className="w-full p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex flex-col items-center text-center gap-3">
        <Sparkles className="w-8 h-8 text-[var(--accent)]" />
        <h3 className="font-display font-bold text-base text-[var(--text)]">
          Build Your First AI Fit
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-xs">
          Your closet needs at least 3 pieces to generate daily outfit recommendations.
        </p>
        <Link
          href="/stylist/upload"
          className="px-5 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold"
        >
          Add Clothing Pieces
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[28px] bg-[var(--surface)] border border-[var(--border-strong)] p-4.5 shadow-md flex flex-col gap-3.5 relative overflow-hidden">
      {/* Date header & Streak chip */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
            {todayGreeting}
          </span>
          <h2 className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight">
            Today&apos;s Fit
          </h2>
        </div>
        <StreakChip />
      </div>

      {/* Occasion segmented chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {occasions.map((occ) => (
          <button
            key={occ}
            type="button"
            onClick={() => {
              setOccasion(occ);
              setIsWorn(false);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all select-none ${
              occasion === occ
                ? "bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)]"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]"
            }`}
          >
            {occ}
          </button>
        ))}
      </div>

      {/* Outfit Collage linking to stylist result */}
      <Link
        href={`/stylist/result/${outfitId}`}
        className="block group relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]"
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-3 gap-1 p-1">
            {outfitItems.slice(0, 3).map((item, idx) => (
              <div
                key={item.id + idx}
                className="relative h-full rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]"
              >
                <Image
                  src={item.image_url}
                  alt={item.type}
                  fill
                  priority
                  sizes="(max-width: 640px) 33vw, 130px"
                  className="object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                />
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* One-line explanation */}
      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
        {explanation}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <Pressable
          type="button"
          onClick={handleWearThis}
          className={`flex-1 py-2.5 px-4 rounded-full flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs ${
            isWorn
              ? "bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--accent-line)]"
              : "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
          }`}
        >
          {isWorn ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Wearing Today</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Wear This</span>
            </>
          )}
        </Pressable>

        <Pressable
          type="button"
          onClick={handleShuffle}
          aria-label="Shuffle fit"
          className="w-10 h-10 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] active:rotate-180 transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </Pressable>
      </div>
    </div>
  );
};
