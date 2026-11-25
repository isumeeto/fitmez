"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  MapPin,
  Tag,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { haptic } from "@/lib/haptics";

interface CreateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGuideModal: React.FC<CreateGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleComplete = () => {
    haptic.success();
    if (typeof window !== "undefined") {
      localStorage.setItem("dripcheck_create_guide_seen", "true");
    }
    onClose();
  };

  const handleNext = () => {
    haptic.light();
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    haptic.light();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleComplete}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal / Sheet Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[410px] max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] bg-[var(--surface)]/95 backdrop-blur-2xl p-6 flex flex-col gap-4 border border-[var(--border-strong)] shadow-2xl overflow-hidden z-10 mx-auto"
            style={{
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
            }}
          >
            {/* Grab handle for mobile */}
            <div className="w-10 h-1 rounded-full bg-[var(--text-subtle)]/30 mx-auto -mt-2 sm:hidden" />

            {/* Header: Progress Pills & Skip Button */}
            <div className="flex items-center justify-between pt-1">
              {/* Step indicator pills */}
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? "w-7 bg-[var(--accent)]"
                        : idx < currentStep
                        ? "w-3 bg-[var(--accent-line)]"
                        : "w-3 bg-[var(--surface-2)]"
                    }`}
                  />
                ))}
                <span className="text-[11px] font-bold text-[var(--accent)] ml-1">
                  Step {currentStep + 1} of 3
                </span>
              </div>

              {/* Skip Button */}
              <button
                type="button"
                onClick={handleComplete}
                className="text-xs font-semibold text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded-full active:scale-95 cursor-pointer"
              >
                Skip
              </button>
            </div>

            {/* Step Content Visuals & Mockups */}
            <div className="flex flex-col gap-4 py-2">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="guide-step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Visual Mockup Card: Framing Corners & Mirror Selfie Silhouette */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden flex flex-col items-center justify-center p-4">
                      {/* Viewfinder corner brackets */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[var(--accent)] rounded-tl-sm" />
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[var(--accent)] rounded-tr-sm" />
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[var(--accent)] rounded-bl-sm" />
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[var(--accent)] rounded-br-sm" />

                      {/* Viewfinder Center Mockup */}
                      <div className="w-16 h-16 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-line)] flex items-center justify-center text-[var(--accent)] shadow-md mb-2">
                        <Camera className="w-8 h-8 stroke-[1.75]" />
                      </div>

                      {/* Mockup Badges */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs">
                          Natural Light • 5000K
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] shadow-xs">
                          4:5 Ratio
                        </span>
                      </div>
                    </div>

                    {/* Step Title & Instruction Text */}
                    <div className="flex flex-col gap-1">
                      <h3
                        id="guide-title"
                        className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight"
                      >
                        Step 1 — Frame Your Fit
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Upload a clean mirror selfie, street shot, or flat-lay in natural light so textures and silhouettes stand out.
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="guide-step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Visual Mockup Card: Interactive Garment Pins */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden flex flex-col items-center justify-center p-4">
                      {/* Interactive Pin 1: Shirt */}
                      <div className="absolute top-[28%] left-[28%] flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-[var(--accent-line)] shadow-lg animate-bounce">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                        <span className="text-[10px] font-bold text-[var(--text)]">
                          Shirt • White
                        </span>
                      </div>

                      {/* Interactive Pin 2: Pants */}
                      <div className="absolute bottom-[28%] right-[24%] flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-[var(--accent-line)] shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                        <span className="text-[10px] font-bold text-[var(--text)]">
                          Pants • Cream
                        </span>
                      </div>

                      {/* Tap target animation ring in center */}
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--accent)]/60 flex items-center justify-center text-[var(--accent)]">
                        <MapPin className="w-5 h-5 stroke-[2]" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-subtle)] mt-2">
                        Tap anywhere to pin garments
                      </span>
                    </div>

                    {/* Step Title & Instruction Text */}
                    <div className="flex flex-col gap-1">
                      <h3
                        id="guide-title"
                        className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight"
                      >
                        Step 2 — Tap to Pin Garments
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        In Step 2, tap anywhere on your photo to drop garment pins so others can inspect and recreate your look.
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="guide-step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Visual Mockup Card: Vibe Tags & Anon Badge */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden flex flex-col items-center justify-center p-4 gap-2.5">
                      {/* Anon badge preview */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-line)] shadow-xs">
                        <Shield className="w-3.5 h-3.5 text-[var(--accent)] stroke-[2]" />
                        <span className="text-xs font-bold text-[var(--accent)]">
                          Anon Mode: u/guest_curator
                        </span>
                      </div>

                      {/* Aesthetic pills */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[280px]">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs">
                          #Minimal
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs">
                          #Streetwear
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs">
                          #OldMoney
                        </span>
                      </div>

                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-subtle)] mt-1">
                        Reddit-Style Anonymity
                      </span>
                    </div>

                    {/* Step Title & Instruction Text */}
                    <div className="flex flex-col gap-1">
                      <h3
                        id="guide-title"
                        className="font-display font-extrabold text-lg text-[var(--text)] tracking-tight"
                      >
                        Step 3 — Vibe Tags & Anon Shield
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Tag your style aesthetic and post with Reddit-style anonymity—your fit takes center stage.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Bottom Controls: Back / Next / Start Posting */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-full bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--surface)] border border-[var(--border)] active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md ml-auto cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-6 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md ml-auto cursor-pointer"
                >
                  <span>Start Posting ✨</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
