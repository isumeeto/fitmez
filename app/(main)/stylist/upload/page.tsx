"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Item } from "@/lib/types";
import { uploadItem } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { BackButton } from "@/components/BackButton";
import { UploadCard } from "@/components/UploadCard";
import { Chip } from "@/components/Chip";
import { ThinkingOrb } from "@/components/ThinkingOrb";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";

export default function UploadItemPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const userId = getUserId();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<Item[]>([]);

  const handleFilesSelected = (files: File[]) => {
    haptic.light();
    setSelectedFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const handleRemovePreview = (index: number) => {
    haptic.light();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0 || analyzing) return;

    haptic.medium();
    setAnalyzing(true);
    const results: Item[] = [];

    try {
      for (const file of selectedFiles) {
        const item = await uploadItem(userId, file);
        results.push(item);
      }
      setAnalyzedItems(results);
      haptic.success();
      showToast(`${results.length} piece${results.length > 1 ? "s" : ""} tagged by AI!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to analyze clothes. Please retry.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-16 flex flex-col animate-fade-in bg-[var(--bg)]">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <BackButton fallbackUrl="/stylist" />
        <h1 className="font-display font-bold text-sm text-[var(--text)] tracking-tight">
          {analyzedItems.length > 0 ? "Identified Pieces" : "Add to Wardrobe"}
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Flow */}
      {analyzing ? (
        /* Thinking Orb Analyzing State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 my-auto">
          <ThinkingOrb
            phrases={[
              "Scanning garment silhouette…",
              "Extracting chromatic tones…",
              "Detecting fabric drape…",
              "Cataloging into your wardrobe…",
            ]}
          />
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
            AI is categorizing your piece with color harmony tags and styling attributes.
          </p>
        </div>
      ) : analyzedItems.length > 0 ? (
        /* Results / Returned Tags state */
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.2]" />
              <span>Successfully added to your personal closet!</span>
            </div>

            <div className="space-y-3">
              {analyzedItems.map((item, idx) => (
                <div
                  key={item.id + idx}
                  className="p-3 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex gap-3.5 items-start"
                >
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[var(--surface-2)] shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.type}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--text)] capitalize">
                        {item.color} {item.type}
                      </span>
                    </div>

                    {/* AI Tag Chips */}
                    <div className="flex flex-wrap gap-1">
                      {item.type && <Chip label={item.type} size="sm" isActive />}
                      {item.color && <Chip label={item.color} size="sm" />}
                      {item.pattern && <Chip label={item.pattern} size="sm" />}
                      {item.fit && <Chip label={item.fit} size="sm" />}
                      {item.style && <Chip label={item.style} size="sm" />}
                      {item.season && <Chip label={item.season} size="sm" />}
                      {item.occasion && <Chip label={item.occasion} size="sm" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => router.push("/stylist")}
              className="w-full h-12 px-4 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm"
            >
              <span>Done & back to wardrobe</span>
              <ArrowRight className="w-4 h-4 stroke-[2.25]" />
            </button>
          </div>
        </div>
      ) : (
        /* Image Picker State */
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <UploadCard
              previews={previews}
              onFilesSelected={handleFilesSelected}
              onRemovePreview={handleRemovePreview}
              multiple={true}
              title="Snap or select pieces"
              subtitle="Tops, bottoms, outerwear, footwear & accessories"
            />

            <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed px-4">
              Tip: Place items on a clean surface or neutral backdrop for optimal AI color and texture extraction.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={selectedFiles.length === 0}
              className="w-full h-12 px-6 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none active:scale-98 shadow-sm"
            >
              <Sparkles className="w-4 h-4 stroke-[2.25]" />
              <span>
                Analyze {selectedFiles.length > 0 ? `(${selectedFiles.length} items)` : ""}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
