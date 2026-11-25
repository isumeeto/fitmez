"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Share2, RotateCcw, Camera, Plus, Upload, X } from "lucide-react";
import { UploadCard } from "@/components/UploadCard";
import { ScanOverlay } from "@/components/ScanOverlay";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Pressable } from "@/components/Pressable";
import { GlassSurface } from "@/components/GlassSurface";
import { rateOutfit } from "@/lib/ai";
import { FitScore, Occasion } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";
import { getMockImage } from "@/lib/mock/images";

export default function RateFitPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<Occasion>("casual");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<FitScore | null>(null);

  const occasions: Occasion[] = ["casual", "office", "date", "party"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setResult(null);
      haptic.light();
    }
  };

  const handleAnalyze = async () => {
    if (!preview || isScanning) return;
    haptic.medium();
    setIsScanning(true);
    setResult(null);

    // Scanning visual runs for 1.8s
    setTimeout(async () => {
      try {
        const score = await rateOutfit(preview, occasion);
        setResult(score);
        haptic.success();
      } finally {
        setIsScanning(false);
      }
    }, 1800);
  };

  const handleShareScore = async () => {
    if (!reportRef.current) return;
    showToast("Generating scorecard image…");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2 });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "drip_scorecard.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My FITMEZ Fit Score",
          text: `Got a ${result?.total}/10 on FITMEZ MIW AI!`,
        });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "drip_scorecard.png";
        a.click();
        showToast("Scorecard saved!");
      }
    } catch {
      showToast("Could not export score image on this device.");
    }
  };

  return (
    <div className="min-h-full px-4 pt-4 pb-28 flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-[var(--border)] mb-4">
        <button
          type="button"
          onClick={() => router.push("/stylist")}
          aria-label="Back to MIW AI"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="font-display font-extrabold text-sm text-[var(--text)] tracking-tight">
          Rate My Fit
        </h1>

        <div className="w-9" />
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col gap-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            AI Vision Appraisal (Mock)
          </span>
          <h2 className="font-display font-extrabold text-xl text-[var(--text)] tracking-tight">
            Outfit Diagnostics
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Upload your mirror selfie to calculate your Drip Score and proportion balance.
          </p>
        </div>

        {!preview ? (
          /* Prominent '+' Upload Card / Dropzone */
          <div className="flex flex-col gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                haptic.light();
                fileInputRef.current?.click();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPreview(url);
                  setResult(null);
                  haptic.light();
                }
              }}
              className="group relative w-full rounded-[28px] glass border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--accent-line)] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_at_center,var(--accent-tint)_0%,transparent_70%)] opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none" />

              <div className="relative w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--accent-line)] flex items-center justify-center text-[var(--accent)] shadow-md group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--accent-glow)] transition-all mb-4">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>

              <h3 className="font-display font-bold text-sm text-[var(--text)] tracking-tight mb-1.5 px-4">
                Upload mirror fit or outfit screenshot from gallery to analyze fit &amp; proportions
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                Supports PNG, JPG, or HEIC format. AI detects garment silhouettes and tonal balance.
              </p>

              <div className="mt-4 px-4 py-2 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold shadow-sm flex items-center gap-1.5 group-hover:opacity-90 transition-opacity">
                <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Choose Photo</span>
              </div>
            </div>

            {/* Quick Sample Outfits */}
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
                      setPreview(getMockImage(sample.imgIdx, 0.75));
                      setOccasion(sample.occ);
                      setResult(null);
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
          /* Preview Card Container with Scanning Overlay */
          <div className="relative w-full aspect-[3/4] max-h-[360px] rounded-[28px] overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-md">
            <Image
              src={preview}
              alt="Outfit to rate"
              fill
              sizes="(max-width: 640px) 100vw, 390px"
              className="object-cover"
            />

            {/* Laser Scan Animation */}
            <ScanOverlay isScanning={isScanning} />

            {/* Quick Actions */}
            {!isScanning && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    fileInputRef.current?.click();
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
                    setPreview(null);
                    setResult(null);
                  }}
                  className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 active:scale-90 cursor-pointer"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Occasion Selector */}
        {!result && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
              Select Context
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all select-none ${
                    occasion === occ
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

        {/* Analyze Button */}
        {!result && (
          <Pressable
            type="button"
            onClick={handleAnalyze}
            disabled={isScanning || !preview}
            className="w-full py-3.5 px-6 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
                <span>Scanning garment drape & colors…</span>
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
        {result && (
          <div ref={reportRef} className="flex flex-col gap-5 pt-2">
            <ScoreGauge score={result} />

            <div className="flex gap-2">
              <Pressable
                type="button"
                onClick={handleShareScore}
                className="flex-1 py-3 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Scorecard</span>
              </Pressable>

              <Pressable
                type="button"
                onClick={() => setResult(null)}
                className="px-4 py-3 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] font-bold text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retest</span>
              </Pressable>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
