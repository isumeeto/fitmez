"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, Sparkles, Tag, EyeOff, Check } from "lucide-react";
import { ALL_OCCASION_TAGS, ALL_STYLE_TAGS } from "@/lib/constants";
import { UploadCard } from "@/components/UploadCard";
import { Chip } from "@/components/Chip";
import { GlassSurface } from "@/components/GlassSurface";
import { Pressable } from "@/components/Pressable";
import { PinLayer } from "@/components/PinLayer";
import { CaptionSuggestions } from "@/components/CaptionSuggestions";
import { CreateGuideModal } from "@/components/CreateGuideModal";
import { createPost } from "@/lib/social";
import { unlockBadge } from "@/lib/badges";
import { useToast } from "@/components/Toast";
import { Pin } from "@/lib/types";
import { haptic } from "@/lib/haptics";
import { spring } from "@/lib/motion";

const STEPS = ["Photo", "Tag", "Details"];

export default function CreatePostPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Streetwear", "Minimal"]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const guideSeen = localStorage.getItem("dripcheck_create_guide_seen");
      if (!guideSeen) {
        setShowGuide(true);
      }
    }
  }, []);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setPreviews([url]);
    }
  };

  const handleRemovePreview = () => {
    setPreviews([]);
    setPins([]);
  };

  const handleAddPin = (pin: Pin) => {
    setPins((prev) => [...prev, pin]);
  };

  const handleRemovePin = (idx: number) => {
    setPins((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleTag = (tag: string) => {
    haptic.light();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = () => {
    haptic.light();
    if (step === 0 && previews.length === 0) {
      showToast("Please select or upload a photo first.", "error");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    haptic.light();
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handlePublish = async () => {
    if (loading || previews.length === 0) return;
    setLoading(true);
    haptic.medium();

    try {
      await createPost({
        image_url: previews[0],
        caption: caption.trim() || "Clean silhouette drape.",
        tags: selectedTags,
        pins,
        is_anonymous: isAnonymous,
      });

      unlockBadge("first_post");
      showToast("Look published to community!");
      router.push("/");
    } catch (err) {
      console.error(err);
      showToast("Failed to create post.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full px-4 pt-4 pb-28 flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Top Header with Cancel */}
      <header className="flex items-center justify-between py-2 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Cancel"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="font-display font-extrabold text-sm text-[var(--text)] tracking-tight">
          Create Outfit Post
        </h1>

        <button
          type="button"
          onClick={() => {
            haptic.light();
            setShowGuide(true);
          }}
          aria-label="Open posting guide"
          className="px-2.5 py-1 rounded-full glass border border-[var(--border)] hover:border-[var(--accent-line)] active:scale-95 transition-all text-xs font-bold text-[var(--accent)] flex items-center gap-1.5 touch-press shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
          <span>Guide</span>
        </button>
      </header>

      {/* Animated 3-Step Indicator (Photo -> Tag -> Details) */}
      <div className="py-4 flex items-center justify-center gap-2">
        {STEPS.map((s, idx) => {
          const isCurrent = step === idx;
          const isDone = step > idx;

          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] shadow-xs"
                    : isDone
                    ? "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
                    : "text-[var(--text-subtle)] border border-transparent"
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{s}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-3 h-0.5 rounded-full bg-[var(--border)]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Step Flow Content */}
      <div className="flex-1 flex flex-col gap-5 py-2">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={spring.snappy}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-display font-bold text-base text-[var(--text)]">
                  Step 1: Choose Outfit Photo
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Select a clean mirror selfie, flat-lay, or street photograph.
                </p>
              </div>

              <UploadCard
                previews={previews}
                onFilesSelected={handleFilesSelected}
                onRemovePreview={handleRemovePreview}
                multiple={false}
                title="Select outfit photo"
                subtitle="High resolution jpeg / png"
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={spring.snappy}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-base text-[var(--text)]">
                    Step 2: Tag Garment Pieces
                  </h2>
                  <span className="text-[11px] font-bold text-[var(--accent)]">
                    {pins.length} / 6 tags
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Tap anywhere on your photo to pin tags like jacket, shoes, or pants.
                </p>
              </div>

              {/* Photo with Interactive Pin Layer */}
              <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-md">
                {previews[0] && (
                  <Image
                    src={previews[0]}
                    alt="Tagged outfit"
                    fill
                    sizes="(max-width: 640px) 100vw, 390px"
                    className="object-cover"
                  />
                )}
                <PinLayer
                  pins={pins}
                  editable
                  onAddPin={handleAddPin}
                  onRemovePin={handleRemovePin}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={spring.snappy}
              className="flex flex-col gap-5 pb-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-display font-bold text-base text-[var(--text)]">
                  Step 3: Details & Styling
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Add context, choose vibes, and customize your anonymous handle.
                </p>
              </div>

              {/* Feature 12: AI Caption Suggestions */}
              <CaptionSuggestions
                image={previews[0] || ""}
                pins={pins}
                onSelectCaption={(cap) => setCaption(cap)}
                onAddTags={(newTags) =>
                  setSelectedTags((prev) => Array.from(new Set([...prev, ...newTags])))
                }
              />

              {/* Caption Textarea */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                    Caption
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {caption.length}/200
                  </span>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="Describe your outfit, cuts, drape, or mood context…"
                  className="w-full p-3.5 rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-xs border border-[var(--border)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>

              {/* Style & Occasion Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
                  Tags & Vibes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set([...ALL_STYLE_TAGS, ...ALL_OCCASION_TAGS])).map((t) => (
                    <Chip
                      key={t}
                      label={`#${t}`}
                      isActive={selectedTags.includes(t)}
                      onClick={() => toggleTag(t)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              {/* Anonymous Posting Toggle */}
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[var(--text)] block">
                      Post Anonymously
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] leading-tight block">
                      Displays only your anonymous u/handle.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--surface-2)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]" />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glass Bottom Action Bar */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] left-0 right-0 max-w-[430px] mx-auto px-4 z-40 pointer-events-none">
        <GlassSurface
          pill
          className="pointer-events-auto h-16 w-full px-4 flex items-center justify-between shadow-xl"
        >
          <Pressable
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-full text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 0 ? "Cancel" : "Back"}</span>
          </Pressable>

          {step < 2 ? (
            <Pressable
              type="button"
              onClick={handleNext}
              disabled={previews.length === 0}
              className="px-5 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Pressable>
          ) : (
            <Pressable
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Publish Look</span>
                </>
              )}
            </Pressable>
          )}
        </GlassSurface>
      </div>

      {/* Ultra-Premium First-Time Posting Guide Walkthrough */}
      <CreateGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
