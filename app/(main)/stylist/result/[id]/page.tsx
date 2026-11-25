"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Item, RecommendResponse } from "@/lib/types";
import { getItems, sendFeedback, recommendOutfit } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { BackButton } from "@/components/BackButton";
import { OutfitCard } from "@/components/OutfitCard";
import { ThinkingOrb } from "@/components/ThinkingOrb";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OutfitResultPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const outfitId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();
  const userId = getUserId();

  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<Item[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        if (typeof window !== "undefined") {
          const prompt = sessionStorage.getItem("dripcheck_custom_prompt");
          if (prompt && isMounted) {
            setCustomPrompt(prompt);
          }
        }

        const items = await getItems(userId);
        if (!isMounted) return;
        setWardrobeItems(items);

        // Check if stored in localStorage from recommendOutfit call
        let foundRec: RecommendResponse | null = null;
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem(`dripcheck_rec_${outfitId}`);
          if (raw) {
            foundRec = JSON.parse(raw);
          }
        }

        // Fallback: if user landed directly or refreshed, generate a recommendation
        if (!foundRec) {
          foundRec = await recommendOutfit(userId, "casual");
        }

        if (isMounted) {
          setRecommendation(foundRec);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [outfitId, userId]);

  const handleRate = async (rating: number) => {
    try {
      await sendFeedback(userId, outfitId, rating);
      showToast(`Feedback noted: ${rating} star${rating > 1 ? "s" : ""}!`, "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTryAnother = async () => {
    setLoading(true);
    try {
      const rec = await recommendOutfit(userId, "casual");
      router.push(`/stylist/result/${rec.outfit_id}`);
    } catch (err) {
      console.error(err);
      showToast("Could not generate alternate look", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLook = () => {
    showToast("Look saved to your collection!", "success");
  };

  if (loading) {
    return (
      <div className="min-h-full px-4 pt-4 pb-28 flex flex-col justify-center items-center my-auto min-h-[60vh]">
        <ThinkingOrb
          phrases={[
            "Checking your closet colors…",
            "Matching silhouette drape…",
            "Selecting footwear balance…",
            "Finalizing MIW AI rationale…",
          ]}
        />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-full px-4 pt-12 pb-28 flex flex-col items-center justify-center">
        <EmptyState
          title="No recommendation found"
          description="We couldn't generate an outfit for this session."
          actionLabel="Back to MIW AI"
          onAction={() => router.push("/stylist")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 pt-3 pb-28 animate-fade-in flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <BackButton fallbackUrl="/stylist" />
        <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-subtle)]">
          MIW AI Recommendation
        </span>
        <div className="w-10" />
      </div>

      {/* Custom Note Callout if user provided one */}
      {customPrompt && (
        <div className="p-3.5 rounded-2xl glass border border-[var(--accent-line)] bg-[var(--surface-2)]/70 flex items-start gap-2.5 shadow-xs animate-fade-in">
          <div className="w-7 h-7 rounded-xl bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] block">
              Your Custom Styling Note
            </span>
            <p className="text-xs text-[var(--text)] italic mt-0.5 leading-relaxed">
              &ldquo;{customPrompt}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Outfit Card with pieces flying in and stylist rationale typing */}
      <OutfitCard
        recommendation={recommendation}
        wardrobeItems={wardrobeItems}
        onRate={handleRate}
        onTryAnother={handleTryAnother}
        onSaveLook={handleSaveLook}
      />
    </div>
  );
}
