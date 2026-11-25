"use client";

import React, { useState, useEffect } from "react";
import { Shield, Trophy } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { getProfile } from "@/lib/social";
import { getItems } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { getUnlockedBadges } from "@/lib/badges";
import { Avatar } from "@/components/Avatar";
import { StyleDNACard } from "@/components/StyleDNACard";
import { StreakChip } from "@/components/StreakChip";
import { AchievementsModal } from "@/components/AchievementsModal";
import { haptic } from "@/lib/haptics";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wardrobeCount, setWardrobeCount] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, string>>({});
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const userId = getUserId();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prof, items] = await Promise.all([
          getProfile(),
          getItems(userId),
        ]);

        if (isMounted) {
          setProfile(prof);
          setWardrobeCount(items.length);
          setUnlockedBadges(getUnlockedBadges());
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      }
    }
    loadData();

    const handleBadgeUnlocked = () => {
      setUnlockedBadges(getUnlockedBadges());
    };
    window.addEventListener("dripcheck_badge_unlocked", handleBadgeUnlocked);

    return () => {
      isMounted = false;
      window.removeEventListener("dripcheck_badge_unlocked", handleBadgeUnlocked);
    };
  }, [userId]);

  const username = profile?.username || "u/anon";
  const userVibes = ["Minimal", "Smart casual", "Streetwear"];
  const unlockedCount = Object.keys(unlockedBadges).length;

  return (
    <div className="min-h-full max-w-[430px] mx-auto px-4 pt-16 pb-28 animate-fade-in flex flex-col space-y-6">
      {/* 1. Profile Identity Card */}
      <div className="flex flex-col items-center text-center relative pt-2">
        {/* Large Orb Avatar with Drifting animation */}
        <div className="mb-3 relative">
          <Avatar
            seed={profile?.avatar_gradient || username}
            size="xl"
            animateDrift={true}
          />
        </div>

        {/* Username with anonymous tag */}
        <div className="flex items-center gap-1.5 mb-1">
          <h1 className="font-display text-xl font-bold text-[var(--text)] tracking-tight">
            {username}
          </h1>
          {profile?.is_anonymous && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)]">
              <Shield className="w-2.5 h-2.5" /> Anon
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
          {profile?.bio || "Curating architectural silhouettes and minimal palettes."}
        </p>

        {/* Streak + Achievements pill */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <StreakChip />
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setIsAchievementsOpen(true);
            }}
            aria-label="View style achievements"
            className="px-3 py-1 rounded-full glass border border-[var(--border)] hover:border-amber-400/40 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs touch-press cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            <Trophy className="w-4 h-4 text-amber-400 fill-amber-400/20 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)] stroke-[2]" />
            <span className="text-xs font-bold text-[var(--text)] tracking-tight">
              {unlockedCount || 3}/6
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Badges
            </span>
          </button>
        </div>

        {/* 3 Counters: POSTS, LIKES, WARDROBE */}
        <div className="w-full mt-4 grid grid-cols-3 divide-x divide-[var(--border)] py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm text-[var(--text)]">
              {profile?.posts_count ?? 8}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Posts
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm text-[var(--text)]">
              {profile?.likes_count ?? 1420}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Likes
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm text-[var(--text)]">
              {wardrobeCount || (profile?.items_count ?? 9)}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Wardrobe
            </span>
          </div>
        </div>
      </div>

      {/* 2. Personal Style DNA Card & 3. Share Style DNA Card CTA */}
      <StyleDNACard username={username} vibes={userVibes} />

      {/* Frosted Glass Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        unlockedBadges={unlockedBadges}
      />
    </div>
  );
}
