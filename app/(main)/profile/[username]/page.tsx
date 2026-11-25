"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Check, UserPlus, Sparkles } from "lucide-react";
import { Post, CreatorProfile } from "@/lib/types";
import {
  getCreatorProfile,
  getCreatorPosts,
  isFollowingUser,
  toggleFollowUser,
} from "@/lib/social";
import { getSession } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { StyleDNACard } from "@/components/StyleDNACard";
import { StreakChip } from "@/components/StreakChip";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";
import { APP_NAME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function CreatorPublicProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const rawParam = resolvedParams.username || "";
  const cleanUsername = decodeURIComponent(rawParam).replace(/^u\//, "").trim();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. Redirect if user views their own profile
  useEffect(() => {
    const session = getSession();
    if (session?.username) {
      const currentClean = session.username.replace(/^u\//, "").toLowerCase();
      if (currentClean === cleanUsername.toLowerCase()) {
        router.replace("/profile");
      }
    }
  }, [cleanUsername, router]);

  // 2. Fetch creator profile and public posts
  useEffect(() => {
    let isMounted = true;
    async function loadCreatorData() {
      if (!cleanUsername) return;
      setLoading(true);
      try {
        const [prof, userPosts] = await Promise.all([
          getCreatorProfile(cleanUsername),
          getCreatorPosts(cleanUsername),
        ]);

        if (isMounted) {
          setProfile(prof);
          setPosts(userPosts);
          setIsFollowing(isFollowingUser(cleanUsername));
        }
      } catch (err) {
        console.error("Failed to load creator profile:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCreatorData();

    // Listen to follow state changes
    const handleFollowChange = (e: Event) => {
      const custom = e as CustomEvent<{ username: string; isFollowing: boolean }>;
      if (custom.detail?.username.toLowerCase() === cleanUsername.toLowerCase()) {
        setIsFollowing(custom.detail.isFollowing);
      }
    };
    window.addEventListener("dripcheck_follow_changed", handleFollowChange);

    return () => {
      isMounted = false;
      window.removeEventListener("dripcheck_follow_changed", handleFollowChange);
    };
  }, [cleanUsername]);

  const handleFollowToggle = () => {
    haptic.medium();
    const nextState = toggleFollowUser(cleanUsername);
    setIsFollowing(nextState);
    showToast(
      nextState
        ? `Following u/${cleanUsername}`
        : `Unfollowed u/${cleanUsername}`
    );
  };

  const handleShareProfile = async () => {
    haptic.light();
    const profileUrl = typeof window !== "undefined" ? window.location.href : "";
    const title = `${cleanUsername} on ${APP_NAME}`;
    const text = `Check out u/${cleanUsername}'s personal style & outfit inspirations on ${APP_NAME}!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: profileUrl });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(profileUrl);
      showToast("Profile link copied to clipboard!");
    } else {
      showToast("Sharing not supported on this browser.");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full max-w-[430px] mx-auto px-4 pt-16 pb-28 flex flex-col space-y-6 animate-fade-in">
        {/* Floating Top Bar Skeleton */}
        <div className="flex items-center justify-between py-2">
          <Skeleton className="w-10 h-10" rounded="full" />
          <Skeleton className="w-24 h-5" rounded="full" />
          <Skeleton className="w-10 h-10" rounded="full" />
        </div>

        {/* Identity Skeleton */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Skeleton className="w-24 h-24" rounded="full" />
          <Skeleton className="w-36 h-6" rounded="full" />
          <Skeleton className="w-56 h-3.5" rounded="full" />
          <Skeleton className="w-32 h-8" rounded="full" />
        </div>

        {/* Stats Row Skeleton */}
        <Skeleton className="w-full h-16" rounded="2xl" />

        {/* Style DNA Skeleton */}
        <Skeleton className="w-full h-64" rounded="3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-full max-w-[430px] mx-auto px-4 pt-16 pb-28 flex flex-col items-center justify-center">
        <EmptyState
          title="Creator not found"
          description={`We couldn't find a creator matching u/${cleanUsername}.`}
          actionLabel="Back to feed"
          onAction={() => router.push("/")}
        />
      </div>
    );
  }

  const displayHandle = `u/${cleanUsername}`;

  return (
    <div className="min-h-full max-w-[430px] mx-auto px-4 pt-3 pb-28 animate-fade-in flex flex-col space-y-6">
      {/* 1. Floating Glass Top Navigation Bar */}
      <header className="sticky top-0 z-30 pt-1 pb-2">
        <div
          className="glass h-13 px-3 rounded-2xl flex items-center justify-between border border-[var(--border)] shadow-xs"
          style={{
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          {/* Back button left */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)] active:scale-90 transition-transform touch-press"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>

          {/* FITMEZ brand center */}
          <Link
            href="/"
            className="flex items-center gap-1.5 focus:outline-none select-none group"
            aria-label={`${APP_NAME} home`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block shrink-0"
              style={{ boxShadow: "0 0 10px var(--accent-glow)" }}
            />
            <span className="font-brand text-lg tracking-[0.16em] uppercase text-[var(--text)] font-normal group-hover:opacity-90 transition-opacity">
              {APP_NAME}
            </span>
          </Link>

          {/* Share button right */}
          <button
            type="button"
            onClick={handleShareProfile}
            aria-label="Share creator profile"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all touch-press"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Creator Identity Section */}
      <section className="flex flex-col items-center text-center relative pt-1">
        {/* Large Avatar Orb with Drifting animation */}
        <div className="mb-3 relative">
          <Avatar
            seed={profile.orbSeed || cleanUsername}
            size="xl"
            animateDrift={true}
          />
        </div>

        {/* Username */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <h1 className="font-display text-xl font-bold text-[var(--text)] tracking-tight">
            {displayHandle}
          </h1>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent-line)]">
            <Sparkles className="w-2.5 h-2.5" /> Creator
          </span>
        </div>

        {/* Bio */}
        <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
          {profile.bio}
        </p>

        {/* Streak Pill & Follow Toggle Button */}
        <div className="mt-3.5 flex items-center justify-center gap-2.5 w-full max-w-xs">
          <StreakChip count={profile.streak} />

          {/* Follow / Following Primary Toggle Button */}
          <button
            type="button"
            onClick={handleFollowToggle}
            aria-label={isFollowing ? "Unfollow creator" : "Follow creator"}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs touch-press active:scale-95 cursor-pointer ${
              isFollowing
                ? "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border-strong)] hover:border-red-400/40"
                : "bg-[var(--accent)] text-[var(--on-accent)] border border-[var(--accent)] hover:brightness-105"
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Core Stats: POSTS, LIKES, WARDROBE */}
        <div className="w-full mt-4 grid grid-cols-3 divide-x divide-[var(--border)] py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm text-[var(--text)]">
              {posts.length}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Posts
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm text-[var(--text)]">
              {profile.likes_count.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Likes
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-sm text-[var(--text)]">
              {profile.items_count}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              Wardrobe
            </span>
          </div>
        </div>
      </section>

      {/* 3. Personal Style DNA Card */}
      <section className="flex flex-col gap-2">
        <StyleDNACard
          username={displayHandle}
          vibes={profile.vibes}
        />
      </section>

      {/* 4. Public Outfit Posts Grid */}
      <section className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display font-bold text-sm text-[var(--text)] tracking-tight">
            Published Looks
          </h2>
          <span className="text-[11px] font-semibold text-[var(--text-subtle)]">
            {posts.length} {posts.length === 1 ? "look" : "looks"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            No published outfits yet from this creator.
          </div>
        ) : (
          <MasonryGrid posts={posts} />
        )}
      </section>
    </div>
  );
}
