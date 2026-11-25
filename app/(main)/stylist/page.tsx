"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Sparkles,
  Shirt,
  Calendar,
  Briefcase,
  Heart,
  PartyPopper,
  ArrowUp,
  Upload,
  X,
  RotateCcw,
} from "lucide-react";
import { OCCASIONS } from "@/lib/constants";
import { Item, FitScore, Occasion } from "@/lib/types";
import { getItems, deleteItem, recommendOutfit } from "@/lib/api";
import { askStylistAI, StylistAIResponse, rateOutfit } from "@/lib/ai";
import { getUserId } from "@/lib/auth";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ItemCard } from "@/components/ItemCard";
import { ItemCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ClosetStats } from "@/components/ClosetStats";
import { Pressable } from "@/components/Pressable";
import { HangerIllustration } from "@/components/illustrations";
import { ScanOverlay } from "@/components/ScanOverlay";
import { ScoreGauge } from "@/components/ScoreGauge";
import { getMockImage } from "@/lib/mock/images";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";
import { MOCK_WARDROBE_ITEMS } from "@/lib/mock/data";

const OCCASION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  casual: Calendar,
  office: Briefcase,
  date: Heart,
  party: PartyPopper,
};

export default function StylistHubPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeSegment, setActiveSegment] = useState<"wardrobe" | "recommend" | "rate">("wardrobe");
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [selectedOccasion, setSelectedOccasion] = useState<string>("casual");
  const [generating, setGenerating] = useState(false);

  // Rate My Fit state
  const [rateImage, setRateImage] = useState<string | null>(null);
  const [rateOccasion, setRateOccasion] = useState<Occasion>("casual");
  const [isRateScanning, setIsRateScanning] = useState<boolean>(false);
  const [rateScore, setRateScore] = useState<FitScore | null>(null);
  const rateFileInputRef = useRef<HTMLInputElement>(null);

  // Talk to MIW AI custom prompt state
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<StylistAIResponse | null>(null);

  const SUGGESTION_CHIPS = [
    "Style my cream pants",
    "Best color combo in my closet?",
    "Layering for a breezy evening",
    "Make it minimal & sharp",
  ];

  const userId = getUserId();

  useEffect(() => {
    let ignore = false;
    getItems(userId)
      .then((data) => {
        if (!ignore) {
          const list = data.length > 0 ? data : MOCK_WARDROBE_ITEMS;
          setItems(list);
          setLoadingItems(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setItems(MOCK_WARDROBE_ITEMS);
          setLoadingItems(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "rate" || tab === "recommend" || tab === "wardrobe") {
        setActiveSegment(tab);
      }
    }
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast("Item deleted from wardrobe", "info");
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast("Item deleted from wardrobe", "info");
    }
  };

  const handleSegmentChange = (val: "wardrobe" | "recommend" | "rate") => {
    setActiveSegment(val);
  };

  const handleRateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRateImage(url);
      setRateScore(null);
      haptic.light();
    }
  };

  const handleAnalyzeRateFit = async () => {
    if (!rateImage || isRateScanning) return;
    haptic.medium();
    setIsRateScanning(true);
    setRateScore(null);

    // 1.6s laser scanning animation
    setTimeout(async () => {
      try {
        const score = await rateOutfit(rateImage, rateOccasion);
        setRateScore(score);
        haptic.success();
      } catch (err) {
        console.error(err);
        showToast("Fit analysis unavailable right now.", "error");
      } finally {
        setIsRateScanning(false);
      }
    }, 1600);
  };

  const handleAskAI = async (promptOverride?: string) => {
    const textToSubmit = (promptOverride || customPrompt).trim();
    if (!textToSubmit) return;
    if (promptOverride) {
      setCustomPrompt(promptOverride);
    }
    haptic.medium();
    setIsAskingAI(true);
    try {
      const res = await askStylistAI(textToSubmit, items, selectedOccasion);
      setAiResponse(res);
    } catch (e) {
      console.error(e);
      showToast("MIW AI is thinking, try again shortly.", "error");
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleGetOutfit = async () => {
    if (items.length < 3) {
      showToast("Add at least 3 wardrobe items first.", "error");
      return;
    }

    haptic.medium();
    setGenerating(true);
    try {
      if (typeof window !== "undefined") {
        if (customPrompt.trim()) {
          sessionStorage.setItem("dripcheck_custom_prompt", customPrompt.trim());
        } else {
          sessionStorage.removeItem("dripcheck_custom_prompt");
        }
      }
      const rec = await recommendOutfit(userId, selectedOccasion);
      router.push(`/stylist/result/${rec.outfit_id}`);
    } catch {
      showToast("Recommendation simulated error, retrying…", "error");
    } finally {
      setGenerating(false);
    }
  };

  const filteredItems =
    categoryFilter === "all"
      ? items
      : items.filter((item) => item.type.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="min-h-full px-4 pt-18 pb-28 animate-fade-in flex flex-col gap-4">
      {/* MIW AI Studio Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> MIW AI Studio
          </span>
          <h1 className="font-display font-extrabold text-2xl text-[var(--text)] tracking-tight">
            MIW AI
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-line)] text-[10px] font-bold text-[var(--accent)]">
          Smart Wardrobe
        </div>
      </div>

      {/* 3-Way Segment Switcher: Wardrobe | Get Outfit | Rate Fit */}
      <SegmentedControl
        options={[
          { id: "wardrobe", label: "Wardrobe" },
          { id: "recommend", label: "Get Outfit", icon: Sparkles },
          { id: "rate", label: "Rate Fit" },
        ]}
        value={activeSegment}
        onChange={handleSegmentChange}
      />

      {activeSegment === "wardrobe" && (
        /* ================= WARDROBE SEGMENT ================= */
        <div className="flex flex-col gap-4 flex-1">
          {/* Feature 10: Closet Stats Strip & Category Rails */}
          <ClosetStats
            items={items}
            activeCategory={categoryFilter}
            onSelectCategory={setCategoryFilter}
          />

          {/* Items Grid */}
          <div className="flex-1 pt-1">
            {loadingItems ? (
              <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState
                icon={HangerIllustration}
                title="Your closet's empty"
                description="Your closet's empty. Let's fix that by uploading pieces from your real wardrobe."
                actionLabel="Add clothing piece"
                onAction={() => router.push("/stylist/upload")}
                className="my-6"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating Action Button to Add Clothing */}
          <div className="fixed bottom-24 right-5 z-30">
            <Pressable
              type="button"
              onClick={() => router.push("/stylist/upload")}
              aria-label="Add wardrobe item"
              className="w-13 h-13 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] shadow-[0_8px_24px_rgba(22,24,17,0.4)] flex items-center justify-center font-bold"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </Pressable>
          </div>
        </div>
      )}

      {activeSegment === "recommend" && (
        /* ================= GET OUTFIT SEGMENT ================= */
        <div className="flex-1 flex flex-col justify-between py-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> MIW AI Consultation
              </span>
              <h2 className="font-display font-extrabold text-xl text-[var(--text)] tracking-tight">
                What Should I Wear?
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Select your occasion context to generate a cohesive tailored combination from your real closet with MIW AI.
              </p>
            </div>

            {/* Occasion Cards with Gradient Art */}
            <div className="grid grid-cols-2 gap-2.5">
              {OCCASIONS.map((occ) => {
                const Icon = OCCASION_ICONS[occ.id] || Sparkles;
                const isSelected = selectedOccasion === occ.id;

                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => {
                      haptic.light();
                      setSelectedOccasion(occ.id);
                    }}
                    className={`p-4 rounded-[24px] text-left border transition-all duration-200 flex flex-col justify-between h-34 focus:outline-none select-none ${
                      isSelected
                        ? "bg-[var(--surface-2)] border-[var(--accent-line)] ring-1 ring-[var(--accent-line)] shadow-md"
                        : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[var(--accent-tint)] text-[var(--accent)]"
                          : "bg-[var(--surface-2)] text-[var(--text-muted)]"
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div>
                      <span className="font-display font-bold text-xs text-[var(--text)] block mb-0.5">
                        {occ.label}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                        {occ.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Talk to MIW AI Interactive Prompt Box Card */}
            <div className="glass rounded-[26px] p-4 flex flex-col gap-3 border border-[var(--border)] shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Talk to MIW AI
                </span>
                {aiResponse && (
                  <button
                    type="button"
                    onClick={() => setAiResponse(null)}
                    className="text-[10px] text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  >
                    Clear reply
                  </button>
                )}
              </div>

              {/* Input Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                  placeholder="Ask MIW AI about your outfit or add styling notes (e.g., 'Style my cream pants for a coffee date')..."
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-2xl bg-[var(--surface-2)] text-xs text-[var(--text)] placeholder:text-[var(--text-subtle)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={!customPrompt.trim() || isAskingAI}
                  aria-label="Send prompt to MIW AI"
                  className="absolute right-1.5 p-2 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-fg)] disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {isAskingAI ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAskAI(chip)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent-line)] border border-[var(--border)] whitespace-nowrap active:scale-95 transition-all shadow-2xs shrink-0 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Animated Loading Indicator */}
              {isAskingAI && (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--accent-line)] flex items-center gap-2.5 animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin shrink-0" />
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    MIW AI analyzing your closet pieces…
                  </span>
                </div>
              )}

              {/* Animated MIW AI Response Card */}
              {aiResponse && !isAskingAI && (
                <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--accent-line)] flex flex-col gap-2.5 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span className="text-[11px] font-bold text-[var(--text)]">
                      MIW AI Stylist Advice
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text)] leading-relaxed italic">
                    &ldquo;{aiResponse.reply}&rdquo;
                  </p>

                  {/* Highlighted Pieces from User Closet */}
                  {aiResponse.suggestedItems.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1 border-t border-[var(--border)]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                        Referenced Closet Pieces
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {aiResponse.suggestedItems.map((item, idx) => (
                          <span
                            key={item.id + idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] capitalize"
                          >
                            {item.color} {item.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Styling Tips */}
                  {aiResponse.stylingTips.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1 border-t border-[var(--border)]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                        Pro Tips
                      </span>
                      <ul className="text-[10px] text-[var(--text-muted)] space-y-1 list-disc list-inside">
                        {aiResponse.stylingTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action CTA */}
          <Pressable
            type="button"
            onClick={handleGetOutfit}
            disabled={generating}
            className="w-full py-3.5 px-6 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display text-sm font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
                <span>MIW AI Styling you…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.25]" />
                <span>Curate Outfit with MIW AI</span>
              </>
            )}
          </Pressable>
        </div>
      )}

      {activeSegment === "rate" && (
        /* ================= RATE FIT SEGMENT ================= */
        <div className="flex-1 flex flex-col gap-5 py-1">
          {/* Header Info */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Vision Appraisal
            </span>
            <h2 className="font-display font-extrabold text-xl text-[var(--text)] tracking-tight">
              Rate My Fit
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Upload your mirror fit check or outfit screenshot to analyze fit, proportions, and color harmony.
            </p>
          </div>

          {/* Hidden Native File Selector */}
          <input
            ref={rateFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleRateFileSelect}
          />

          {!rateImage ? (
            /* 1. Prominent, Premium '+' Upload Card / Button Dropzone */
            <div className="flex flex-col gap-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  haptic.light();
                  rateFileInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    rateFileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setRateImage(url);
                    setRateScore(null);
                    haptic.light();
                  }
                }}
                className="group relative w-full rounded-[28px] glass border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--accent-line)] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {/* Glow Accent Backdrop */}
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_at_center,var(--accent-tint)_0%,transparent_70%)] opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none" />

                {/* Plus / Upload Animated Icon Button */}
                <div className="relative w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--accent-line)] flex items-center justify-center text-[var(--accent)] shadow-md group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--accent-glow)] transition-all mb-4">
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </div>

                {/* Copy */}
                <h3 className="font-display font-bold text-sm text-[var(--text)] tracking-tight mb-1.5 px-4">
                  Upload mirror fit or outfit screenshot from gallery to analyze fit &amp; proportions
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                  Supports PNG, JPG, or HEIC format. AI evaluates drape balance, silhouette lines, and tonal palette.
                </p>

                {/* Select Action Pill */}
                <div className="mt-4 px-4 py-2 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold shadow-sm flex items-center gap-1.5 group-hover:opacity-90 transition-opacity">
                  <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Choose Photo</span>
                </div>
              </div>

              {/* Or Try Sample Outfit Chips */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
                  Or test with a sample outfit
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Street Drape", imgIdx: 2, occ: "casual" as Occasion },
                    { label: "Smart Minimal", imgIdx: 6, occ: "office" as Occasion },
                    { label: "Date Tailoring", imgIdx: 11, occ: "date" as Occasion },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => {
                        haptic.light();
                        setRateImage(getMockImage(sample.imgIdx, 0.75));
                        setRateOccasion(sample.occ);
                        setRateScore(null);
                      }}
                      className="p-2.5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent-line)] text-left transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-[var(--text)] block truncate">
                        {sample.label}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] capitalize block">
                        {sample.occ} look
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 2. Preview Card & Analysis Flow */
            <div className="flex flex-col gap-4">
              {/* Clean Preview Card */}
              <div className="relative w-full aspect-[3/4] max-h-[360px] rounded-[28px] overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-md">
                <Image
                  src={rateImage}
                  alt="Outfit to rate"
                  fill
                  sizes="(max-width: 640px) 100vw, 390px"
                  className="object-cover"
                />

                {/* Laser Scan Animation */}
                <ScanOverlay isScanning={isRateScanning} />

                {/* Quick Change / Reset Photo Button */}
                {!isRateScanning && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        rateFileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 active:scale-90 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        setRateImage(null);
                        setRateScore(null);
                      }}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 active:scale-90 cursor-pointer"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Occasion Context Selector */}
              {!rateScore && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
                    Outfit Context
                  </span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {(["casual", "office", "date", "party"] as Occasion[]).map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => {
                          haptic.light();
                          setRateOccasion(occ);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all select-none cursor-pointer ${
                          rateOccasion === occ
                            ? "bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] shadow-xs"
                            : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active "Analyze Fit ✨" Button */}
              {!rateScore && (
                <Pressable
                  type="button"
                  onClick={handleAnalyzeRateFit}
                  disabled={isRateScanning}
                  className="w-full py-3.5 px-6 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isRateScanning ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
                      <span>Scanning drape, color harmony & silhouette…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Fit ✨</span>
                    </>
                  )}
                </Pressable>
              )}

              {/* Diagnostic Scorecard Result */}
              {rateScore && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <ScoreGauge score={rateScore} />

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        setRateImage(null);
                        setRateScore(null);
                      }}
                      className="flex-1 py-3 px-4 rounded-full bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent-line)] font-display font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Rate Another Fit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        rateFileInputRef.current?.click();
                      }}
                      className="py-3 px-4 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>New Photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
