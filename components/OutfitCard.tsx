"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Sparkles,
  Bookmark,
  RotateCcw,
  Heart,
  MoreVertical,
  RefreshCw,
  Share2,
  Flag,
} from "lucide-react";
import { Item, RecommendResponse } from "@/lib/types";
import { StarRating } from "./StarRating";
import { ItemTypeIcon } from "./ItemCard";
import { Pressable } from "./Pressable";
import { haptic } from "@/lib/haptics";
import { MenuItem } from "./MenuItem";
import { ActionButtonBar } from "./ActionButtonBar";

export { ActionButtonBar } from "./ActionButtonBar";
export { MenuItem } from "./MenuItem";

// ----------------------------------------------------
// 1. Feed OutfitCard Component (User Request Spec)
// ----------------------------------------------------
export interface FeedOutfit {
  id: string;
  image: string;
  username: string;
  likes: number;
}

export interface FeedOutfitCardProps {
  outfit: FeedOutfit;
  isMenuOpen: boolean;
  onMenuToggle: (open: boolean) => void;
  onRecreate?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onReport?: () => void;
}

export function FeedOutfitCard({
  outfit,
  isMenuOpen,
  onMenuToggle,
  onRecreate,
  onSave,
  onShare,
  onReport,
}: FeedOutfitCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const recreateOverlayRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isRecreateOpen, setIsRecreateOpen] = useState(false);

  // Mock matched pieces data
  const matchedPieces = [
    { id: 1, type: "White Shirt", fit: "Minimal", image: "/mock/shirt.jpg", matchPercentage: 94 },
    { id: 2, type: "Cream Pants", fit: "Minimal Fit", image: "/mock/pants.jpg", matchPercentage: 88 },
    { id: 3, type: "White Shoes", fit: "Minimal", image: "/mock/shoes.jpg", matchPercentage: 91 },
  ];

  // Ensure overlays start at the very top (scrollTop = 0)
  useEffect(() => {
    if (isRecreateOpen && recreateOverlayRef.current) {
      recreateOverlayRef.current.scrollTop = 0;
      requestAnimationFrame(() => {
        if (recreateOverlayRef.current) {
          recreateOverlayRef.current.scrollTop = 0;
        }
      });
    }
  }, [isRecreateOpen]);

  useEffect(() => {
    if (isMenuOpen && menuOverlayRef.current) {
      menuOverlayRef.current.scrollTop = 0;
      requestAnimationFrame(() => {
        if (menuOverlayRef.current) {
          menuOverlayRef.current.scrollTop = 0;
        }
      });
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onMenuToggle(false);
        setIsRecreateOpen(false);
      }
    };

    if (isMenuOpen || isRecreateOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen, isRecreateOpen, onMenuToggle]);

  return (
    <div
      ref={cardRef}
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#9CA763]/10 to-transparent border border-[#9CA763]/20 shadow-lg"
      style={{ borderRadius: '16px' }}
    >
      {/* Base Image */}
      <div className="relative w-full aspect-[3/4]">
        <Image
          src={outfit.image}
          alt="outfit"
          fill
          sizes="(max-width: 640px) 100vw, 390px"
          className="object-cover"
        />
      </div>

      {/* Footer - Locked height & positioning */}
      <div className="absolute bottom-0 left-0 right-0 h-16 min-h-[64px] bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end pointer-events-none">
        <p className="text-white font-semibold text-sm truncate">{outfit.username}</p>
        <p className="text-white/70 text-xs">{outfit.likes + (isLiked ? 1 : 0)} likes</p>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-30">
        <button
          onClick={() => setIsLiked(!isLiked)}
          aria-label={isLiked ? "Unlike post" : "Like post"}
          className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl backdrop-saturate-180 border transition-all duration-200 active:scale-95 ${
            isLiked 
              ? 'bg-[#FF7A8A]/80 border-[#FF7A8A]/50' 
              : 'bg-white/15 border-white/20 hover:bg-white/25'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className="text-white" />
        </button>

        <button
          onClick={() => {
            setIsRecreateOpen(true);
            onRecreate?.();
          }}
          aria-label="Recreate this look"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl backdrop-saturate-180 transition-all duration-200 active:scale-95"
        >
          <RefreshCw size={18} />
        </button>

        <button
          onClick={() => onMenuToggle(true)}
          aria-label="More options"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl backdrop-saturate-180 transition-all duration-200 active:scale-95"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Three-Dots Menu Overlay (Light Milky Frosted Glass) */}
      {isMenuOpen && (
        <div 
          ref={(el) => {
            menuOverlayRef.current = el;
            if (el) el.scrollTop = 0;
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full rounded-2xl z-50 animate-fade-in no-scrollbar"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            background: 'rgba(255, 255, 255, 0.38)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            padding: '12px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div className="flex flex-col gap-1 w-full flex-1">
            <MenuItem
              icon="📌"
              label="Save to Collection"
              onClick={() => {
                onSave?.();
              }}
              textColor="text-[#1a1a1a]"
            />

            <MenuItem
              icon="🔗"
              label="Share"
              onClick={() => {
                onShare?.();
              }}
              textColor="text-[#1a1a1a]"
            />

            <div className="h-px bg-black/10 my-1" />

            <MenuItem
              icon="⚠️"
              label="Report"
              onClick={() => {
                onReport?.();
              }}
              variant="danger"
              textColor="text-[#dc2626]"
            />
          </div>

          <button
            onClick={() => onMenuToggle(false)}
            className="w-full px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#1a1a1a] hover:bg-black/5 mt-auto active:scale-95 transition-transform flex-shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* RECREATE OVERLAY - LIGHT MILKY FROSTED GLASS */}
      {isRecreateOpen && (
        <div 
          ref={(el) => {
            recreateOverlayRef.current = el;
            if (el) el.scrollTop = 0;
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full rounded-2xl z-50 animate-fade-in no-scrollbar"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            background: 'rgba(255, 255, 255, 0.38)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            padding: '12px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Header */}
          <h3 
            className="text-[#1a1a1a] font-bold text-xs tracking-tight uppercase flex-shrink-0"
            style={{ marginBottom: '8px', flexShrink: 0 }}
          >
            MATCHED WARDROBE PIECES
          </h3>

          {/* Scrollable Items Container */}
          <div 
            className="flex flex-col gap-1.5 w-full flex-1"
            style={{ boxSizing: 'border-box', minHeight: 0 }}
          >
            {matchedPieces.map((piece) => (
              <div
                key={piece.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  borderRadius: '12px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                className="shadow-xs hover:bg-white/90 transition-colors"
              >
                {/* Thumbnail - 32px x 32px */}
                <div 
                  className="relative rounded-lg bg-[#9CA763]/25 overflow-hidden flex items-center justify-center text-xs font-bold text-[#1a1a1a]"
                  style={{ width: '32px', height: '32px', flexShrink: 0 }}
                >
                  {piece.image ? (
                    <Image
                      src={piece.image}
                      alt={piece.type}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    piece.type.charAt(0)
                  )}
                </div>

                {/* Middle Text - Truncate cleanly */}
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <p className="text-[#1a1a1a] text-xs font-bold truncate leading-tight">
                    {piece.type}
                  </p>
                  <p className="text-[#555] text-[10px] font-medium truncate leading-tight">
                    {piece.fit}
                  </p>
                </div>

                {/* Percentage Badge - Never Clipped */}
                <span 
                  className="text-[#1a1a1a] text-xs font-bold whitespace-nowrap"
                  style={{ flexShrink: 0 }}
                >
                  {piece.matchPercentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div 
            className="flex gap-2 flex-shrink-0"
            style={{ marginTop: '8px', flexShrink: 0, width: '100%' }}
          >
            <button 
              onClick={() => setIsRecreateOpen(false)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/10 text-[#1a1a1a] text-xs font-medium hover:bg-black/20 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setIsRecreateOpen(false);
              }}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#9CA763] text-white text-xs font-medium hover:bg-[#8B964F] transition-all active:scale-95 shadow-xs"
            >
              Recreate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. Stylist Recommendation Card (Original Stylist feature)
// ----------------------------------------------------
export interface StylistOutfitCardProps {
  recommendation: RecommendResponse;
  wardrobeItems: Item[];
  onRate?: (rating: number) => void;
  onTryAnother?: () => void;
  onSaveLook?: () => void;
}

export function StylistOutfitCard({
  recommendation,
  wardrobeItems,
  onRate,
  onTryAnother,
  onSaveLook,
}: StylistOutfitCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [rated, setRated] = useState<number | null>(null);

  // Typing effect & Tap to skip
  const fullText =
    recommendation.explanation ||
    "Clean tonal layering in deep sea hues with relaxed drape.";
  const [typedChars, setTypedChars] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSkipped) {
      setTypedChars(fullText.length);
      return;
    }

    typingTimer.current = setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= fullText.length) {
          if (typingTimer.current) clearInterval(typingTimer.current);
          return fullText.length;
        }
        return prev + 1;
      });
    }, 25);

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [fullText, isSkipped]);

  const handleSkipAnimation = () => {
    if (!isSkipped) {
      haptic.light();
      setIsSkipped(true);
      setTypedChars(fullText.length);
      if (typingTimer.current) clearInterval(typingTimer.current);
    }
  };

  const handleSave = () => {
    haptic.success();
    setIsSaved(!isSaved);
    onSaveLook?.();
  };

  const handleRate = (rating: number) => {
    haptic.light();
    setRated(rating);
    onRate?.(rating);
  };

  const resolvedItems = recommendation.items.map((recItem) => {
    const fullItem = wardrobeItems.find((w) => w.id === recItem.id);
    return {
      id: recItem.id,
      type: recItem.type,
      color: recItem.color,
      image_url: fullItem?.image_url,
    };
  });

  const whyChips = ["Color Harmony", "Occasion Match", "Proportion Balance"];

  return (
    <div
      onClick={handleSkipAnimation}
      className="flex flex-col gap-4 cursor-pointer select-none"
    >
      {/* Skip indicator prompt */}
      {!isSkipped && typedChars < fullText.length && (
        <div className="flex justify-end">
          <span className="text-[10px] font-bold text-[var(--accent)] tracking-wider uppercase animate-pulse">
            Tap anywhere to skip reveal
          </span>
        </div>
      )}

      {/* Visual Collage of Pieces */}
      <div className="rounded-[28px] p-3.5 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Ensemble</span>
          </div>
          <span className="text-[11px] text-[var(--text-subtle)] font-medium">
            {resolvedItems.length} pieces
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {resolvedItems.map((item, idx) => {
            const isFullSpan = resolvedItems.length % 2 !== 0 && idx === 0;

            return (
              <motion.div
                key={item.id + idx}
                initial={isSkipped ? false : { opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: isSkipped ? 0 : idx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] ${
                  isFullSpan ? "col-span-2 h-44" : "h-36"
                }`}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={`${item.color} ${item.type}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[var(--text-subtle)] bg-[var(--surface-2)]">
                    <ItemTypeIcon type={item.type} className="w-7 h-7 stroke-[1.75]" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-md capitalize">
                    {item.color} {item.type}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Stylist Explanation Card with animated typing text */}
      <div className="rounded-[28px] p-5 ai-gradient-border bg-[var(--surface)] shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            MIW AI Rationale
          </span>
          <div className="flex gap-1">
            {whyChips.map((chip) => (
              <span
                key={chip}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--accent-tint)] text-[var(--accent)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <p className="font-sans text-xs text-[var(--text)] leading-relaxed min-h-[48px]">
          &ldquo;{fullText.slice(0, typedChars)}&rdquo;
          {typedChars < fullText.length && (
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[var(--accent)] animate-pulse align-middle" />
          )}
        </p>
      </div>

      {/* Rating & Actions Card */}
      <div className="rounded-[28px] p-4 bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col items-center gap-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {rated ? "Feedback logged. MIW AI learning updated!" : "Rate this outfit combination"}
        </span>
        <StarRating onRate={handleRate} size="md" />

        <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[var(--border)]">
          <Pressable
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTryAnother?.();
            }}
            className="py-3 px-4 rounded-full bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold flex items-center justify-center gap-2 border border-[var(--border)]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Shuffle</span>
          </Pressable>

          <Pressable
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className={`py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isSaved
                ? "bg-[var(--btn-bg)] text-[var(--btn-fg)] shadow-sm"
                : "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
            <span>{isSaved ? "Saved" : "Save Look"}</span>
          </Pressable>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. Polymorphic / Unified OutfitCard Export
// ----------------------------------------------------
export type OutfitCardProps =
  | FeedOutfitCardProps
  | StylistOutfitCardProps;

export function OutfitCard(props: OutfitCardProps) {
  if ("recommendation" in props) {
    return <StylistOutfitCard {...props} />;
  }
  return <FeedOutfitCard {...props} />;
}

export default OutfitCard;
