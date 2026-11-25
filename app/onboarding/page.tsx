"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Pressable } from "@/components/Pressable";
import { APP_NAME } from "@/lib/constants";
import { spring } from "@/lib/motion";
import { haptic } from "@/lib/haptics";

const ALL_VIBES = [
  "Streetwear",
  "Minimal",
  "Old money",
  "Y2K",
  "Korean casual",
  "Techwear",
  "Smart casual",
  "Athleisure",
  "Vintage",
  "Gorpcore",
  "Preppy",
  "Edgy",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["Minimal", "Streetwear", "Smart casual"]);

  const toggleVibe = (vibe: string) => {
    haptic.light();
    if (selectedVibes.includes(vibe)) {
      if (selectedVibes.length > 3) {
        setSelectedVibes(selectedVibes.filter((v) => v !== vibe));
      }
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleFinish = () => {
    haptic.success();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dripcheck_onboarded", "true");
        localStorage.setItem("dripcheck_vibes", JSON.stringify(selectedVibes));
        document.cookie = "dripcheck_onboarded=1; path=/; max-age=31536000; SameSite=Lax";
      } catch {}
    }
    router.replace("/login");
  };

  const nextSlide = () => {
    haptic.light();
    if (slide < 2) {
      setSlide(slide + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[radial-gradient(circle,var(--accent-glow)_0%,transparent_70%)] pointer-events-none blur-2xl" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]" />
          <span className="font-brand font-normal text-lg tracking-[0.16em] uppercase text-[var(--text)]">
            {APP_NAME}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFinish}
          className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none"
        >
          Skip
        </button>
      </div>

      {/* Slides Container */}
      <div className="flex-1 flex flex-col justify-center items-center text-center z-10 py-6 max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {slide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring.snappy}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-[var(--surface-2)] border border-[var(--border)] shadow-xl flex items-center justify-center text-[var(--accent)] mb-2">
                <Sparkles className="w-10 h-10" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-[var(--text)] tracking-tight">
                Your Closet, Styled by AI
              </h1>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
                Upload what you own. FITMEZ and MIW AI understand silhouettes, textures, and color theory to curate tailored outfits every morning.
              </p>
            </motion.div>
          )}

          {slide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring.snappy}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-[var(--surface-2)] border border-[var(--border)] shadow-xl flex items-center justify-center text-[var(--accent)] mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-dashed animate-spin" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-[var(--text)] tracking-tight">
                Get Inspired. Stay Anonymous.
              </h1>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
                Explore community outfits, recreate looks with your existing wardrobe, and post fits with automatic identity protection.
              </p>
            </motion.div>
          )}

          {slide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring.snappy}
              className="flex flex-col items-center gap-3 w-full"
            >
              <h1 className="font-display font-extrabold text-xl text-[var(--text)] tracking-tight">
                Pick Your Style Vibes
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Select at least 3 aesthetics to calibrate your For You feed.
              </p>

              <div className="flex flex-wrap justify-center gap-2 pt-2 max-h-[44vh] overflow-y-auto no-scrollbar">
                {ALL_VIBES.map((vibe) => {
                  const isSelected = selectedVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => toggleVibe(vibe)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all select-none ${
                        isSelected
                          ? "bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] shadow-xs scale-102"
                          : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
                      }`}
                    >
                      <span>{vibe}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 z-10 pb-4">
        {/* Step Indicator Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                slide === i
                  ? "w-6 bg-[var(--accent)]"
                  : "w-1.5 bg-[var(--border-strong)]"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Pressable
          type="button"
          onClick={nextSlide}
          className="w-full py-3.5 px-6 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          <span>{slide === 2 ? "Get Started" : "Continue"}</span>
          <ArrowRight className="w-4 h-4" />
        </Pressable>
      </div>
    </div>
  );
}
