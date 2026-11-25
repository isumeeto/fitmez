"use client";

import React, { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { suggestCaptions } from "@/lib/ai";
import { Pin } from "@/lib/types";
import { haptic } from "@/lib/haptics";
import { Pressable } from "./Pressable";

interface CaptionSuggestionsProps {
  image: string;
  pins?: Pin[];
  onSelectCaption: (caption: string) => void;
  onAddTags: (tags: string[]) => void;
}

export const CaptionSuggestions: React.FC<CaptionSuggestionsProps> = ({
  image,
  pins = [],
  onSelectCaption,
  onAddTags,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    captions: string[];
    suggestedTags: string[];
  } | null>(null);

  const handleGenerate = async () => {
    haptic.medium();
    setLoading(true);
    try {
      const res = await suggestCaptions(image, pins);
      setSuggestions(res);
      onAddTags(res.suggestedTags);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
          AI Styling Assistant
        </span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs font-bold text-[var(--accent)] hover:brightness-110 flex items-center gap-1.5 focus:outline-none"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? "Generating…" : "Suggest Caption"}</span>
        </button>
      </div>

      {suggestions && (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
            Tap a caption to apply
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestions.captions.map((cap, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  haptic.light();
                  onSelectCaption(cap);
                }}
                className="p-2.5 rounded-xl text-left text-xs text-[var(--text)] font-medium bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent-line)] transition-all flex items-start justify-between gap-2"
              >
                <span>&ldquo;{cap}&rdquo;</span>
                <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex flex-wrap gap-1">
            <span className="text-[10px] text-[var(--text-subtle)] mr-1 self-center">
              Suggested tags:
            </span>
            {suggestions.suggestedTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-tint)] text-[var(--accent)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
