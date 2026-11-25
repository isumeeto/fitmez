"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  Tag,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Post } from "@/lib/types";
import { getPost, getFeed, toggleLike } from "@/lib/social";
import { BackButton } from "@/components/BackButton";
import { PostCard } from "@/components/PostCard";
import { Chip } from "@/components/Chip";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { PinLayer } from "@/components/PinLayer";
import { HeartBurst } from "@/components/HeartBurst";
import { CollectionsSheet } from "@/components/CollectionsSheet";
import { RecreateSheet } from "@/components/RecreateSheet";
import { Pressable } from "@/components/Pressable";
import { haptic } from "@/lib/haptics";
import { spring, keyframeTransition } from "@/lib/motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const { showToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [similarPosts, setSimilarPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showRecreate, setShowRecreate] = useState(false);

  // Double tap detection
  const [lastTap, setLastTap] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const item = await getPost(postId);
        if (isMounted && item) {
          setPost(item);
          setIsLiked(item.likedByMe ?? item.is_liked);
          setLikesCount(item.likes);

          // Find similar looks (matching vibes or general feed)
          const all = await getFeed();
          const filtered = all
            .filter((p) => p.id !== postId)
            .slice(0, 4);
          setSimilarPosts(filtered);
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
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    if (next) {
      haptic.medium();
      setShowHeartBurst(true);
    } else {
      haptic.light();
    }

    try {
      const res = await toggleLike(post.id);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes);
    } catch (err) {
      console.error(err);
      setIsLiked(!next);
      setLikesCount((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!isLiked) {
        handleLike();
      } else {
        setShowHeartBurst(true);
        haptic.medium();
      }
    }
    setLastTap(now);
  };

  const handleShare = () => {
    haptic.light();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "info");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full px-4 pt-4 pb-28 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" rounded="full" />
          <div className="space-y-1.5">
            <Skeleton className="w-28 h-3.5" rounded="full" />
            <Skeleton className="w-16 h-2.5" rounded="full" />
          </div>
        </div>
        <Skeleton className="w-full aspect-[4/5]" rounded="3xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="w-3/4 h-4" rounded="full" />
          <Skeleton className="w-1/2 h-3" rounded="full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-full px-4 pt-16 pb-28 flex flex-col items-center justify-center">
        <EmptyState
          title="Fit not found"
          description="This look might have been archived or removed from the feed."
          actionLabel="Back to feed"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const username = post.author?.username || post.username || "anonymous";
  const orbSeed = post.author?.orbSeed || username;
  const imageUrl = post.image || post.image_url;
  const pinsCount = post.pins?.length || 0;
  const tagsList = post.vibes || post.tags || [];

  return (
    <div className="min-h-full px-4 pt-3 pb-28 flex flex-col space-y-4 animate-fade-in">
      {/* Top Bar with author and quick share */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallbackUrl="/" />
          <Link
            href={`/profile/${username.replace(/^u\//, "")}`}
            className="flex items-center gap-2.5 group hover:opacity-85 transition-opacity"
            aria-label={`View profile of u/${username.replace(/^u\//, "")}`}
          >
            <Avatar seed={orbSeed} size="md" />
            <div className="flex flex-col">
              <span className="font-bold text-xs text-[var(--text)] tracking-tight group-hover:underline">
                u/{username.replace(/^u\//, "")}
              </span>
              <span className="text-[10px] text-[var(--text-subtle)] flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {post.createdAt || post.created_at || "Recent"}
              </span>
            </div>
          </Link>
        </div>

        <button
          onClick={handleShare}
          aria-label="Share post"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Image Container with View Transition & PinLayer */}
      <div
        onClick={handleDoubleTap}
        className="relative w-full aspect-[4/5] rounded-[26px] overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-md select-none"
        style={
          {
            viewTransitionName: `post-${post.id}`,
          } as React.CSSProperties
        }
      >
        <Image
          src={imageUrl}
          alt={post.caption || "Outfit look"}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 390px"
          className="object-cover"
        />

        {/* Pin layer when visible */}
        {showTags && post.pins && post.pins.length > 0 && (
          <PinLayer pins={post.pins} editable={false} />
        )}

        {/* Double-tap heart burst animation */}
        {showHeartBurst && (
          <HeartBurst onComplete={() => setShowHeartBurst(false)} />
        )}

        {/* Tags toggle button */}
        {pinsCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              haptic.light();
              setShowTags(!showTags);
            }}
            className={`glass absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold border transition-all z-20 ${
              showTags
                ? "bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)]"
                : "text-[var(--text)] border-[var(--border)]"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{showTags ? "Hide tags" : `Tags (${pinsCount})`}</span>
          </button>
        )}
      </div>

      {/* Action Row: Like, Save to Collection, Recreate Look */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <Pressable
            onClick={handleLike}
            className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 border transition-all ${
              isLiked
                ? "bg-[var(--like)]/15 text-[var(--like)] border-[var(--like)]/40 shadow-xs"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
            }`}
          >
            <motion.div
              animate={isLiked ? { scale: 1.18 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "fill-[var(--like)] stroke-[var(--like)]" : ""
                }`}
              />
            </motion.div>
            <span className="text-xs font-bold">{likesCount}</span>
          </Pressable>

          {/* Bookmark / Collection Button */}
          <Pressable
            onClick={() => {
              haptic.light();
              setShowCollections(true);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]"
            aria-label="Save to collection"
          >
            <Bookmark className="w-4 h-4" />
          </Pressable>
        </div>

        {/* Recreate Look Button (Feature 2) */}
        <Pressable
          onClick={() => {
            haptic.medium();
            setShowRecreate(true);
          }}
          className="px-4 py-2 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-97 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recreate Look</span>
        </Pressable>
      </div>

      {/* Caption & Metadata Card */}
      <div className="p-4 rounded-[22px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-2.5">
        <p className="text-xs text-[var(--text)] leading-relaxed">
          {post.caption}
        </p>

        {/* Vibes / Tags Chips */}
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tagsList.map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Similar Looks Section */}
      {similarPosts.length > 0 && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Similar Looks</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {similarPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sheets */}
      <CollectionsSheet
        isOpen={showCollections}
        onClose={() => setShowCollections(false)}
        postId={post.id}
      />

      <RecreateSheet
        isOpen={showRecreate}
        onClose={() => setShowRecreate(false)}
        post={post}
      />
    </div>
  );
}
