"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { SheetBottom } from "./SheetBottom";
import { ThinkingOrb } from "./ThinkingOrb";
import { Post, MatchResult, Item } from "@/lib/types";
import { recreateLook } from "@/lib/ai";
import { MOCK_WARDROBE_ITEMS } from "@/lib/mock/data";
import { unlockBadge } from "@/lib/badges";

interface RecreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

export const RecreateSheet: React.FC<RecreateSheetProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    let active = true;
    if (isOpen && post) {
      setLoading(true);
      recreateLook(post.id).then((res) => {
        if (active) {
          setResult(res);
          setLoading(false);
          unlockBadge("first_recreate");
        }
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen, post]);

  if (!post) return null;

  return (
    <SheetBottom isOpen={isOpen} onClose={onClose} title="Recreate This Look">
      <div className="flex flex-col gap-5 pb-6">
        {loading ? (
          <ThinkingOrb
            phrases={[
              "Scanning original look silhouette…",
              "Matching pieces from your wardrobe…",
              "Calculating color harmony match %…",
            ]}
          />
        ) : (
          result && (
            <div className="flex flex-col gap-5">
              {/* Comparison Header */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Inspiration
                  </span>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
                    <Image
                      src={post.image || post.image_url}
                      alt={post.caption}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                    Your Version (91% Match)
                  </span>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[var(--accent-line)] bg-[var(--surface-2)] p-2 grid grid-cols-2 gap-1.5">
                    {result.matched.slice(0, 4).map((match) => {
                      const item = MOCK_WARDROBE_ITEMS.find((w) => w.id === match.itemId) || MOCK_WARDROBE_ITEMS[0];
                      return (
                        <div
                          key={match.itemId}
                          className="relative rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <Image
                            src={item.image_url}
                            alt={item.type}
                            fill
                            sizes="(max-width: 640px) 25vw, 100px"
                            className="object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Matched Pieces List */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Matched Wardrobe Pieces
                </h4>
                <div className="flex flex-col gap-2">
                  {result.matched.map((match) => {
                    const item =
                      MOCK_WARDROBE_ITEMS.find((w) => w.id === match.itemId) ||
                      MOCK_WARDROBE_ITEMS[0];

                    return (
                      <div
                        key={match.itemId}
                        className="p-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.type}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text)] capitalize">
                              {item.color} {item.type}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] capitalize">
                              {item.style || "Minimal"} fit
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent-tint)] text-[var(--accent)] text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{match.matchPct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Pieces */}
              {result.missing.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                    <AlertCircle className="w-4 h-4 text-[var(--accent-soft)]" />
                    <span>To complete this look, consider adding:</span>
                  </div>
                  <ul className="flex flex-col gap-1 pl-5 list-disc text-xs text-[var(--text-muted)]">
                    {result.missing.map((missingItem, idx) => (
                      <li key={idx} className="font-medium">
                        {missingItem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </SheetBottom>
  );
};
