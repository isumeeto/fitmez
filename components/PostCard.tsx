"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MoreVertical, RefreshCw, Bookmark, Sparkles, Share2, Flag } from "lucide-react";
import { Post } from "@/lib/types";
import { toggleLike } from "@/lib/social";
import { HeartBurst } from "./HeartBurst";
import { CollectionsSheet } from "./CollectionsSheet";
import { haptic } from "@/lib/haptics";
import { useToast } from "./Toast";
import { useMenu } from "@/lib/MenuContext";

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export const PostCard: React.FC<PostCardProps> = React.memo(
  function PostCard({ post, priority = false }) {
    const { showToast } = useToast();
    const { activeMenuId, setActiveMenuId, closeMenu } = useMenu();
    const isMenuOpen = activeMenuId === post.id;

    const [isLiked, setIsLiked] = useState(post.likedByMe ?? post.is_liked ?? false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [showBurst, setShowBurst] = useState(false);
    const [burstPos, setBurstPos] = useState<{ x: number; y: number } | undefined>();
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isRecreateOpen, setIsRecreateOpen] = useState(false);
    const [isLifted, setIsLifted] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const recreateOverlayRef = useRef<HTMLDivElement>(null);
    const menuOverlayRef = useRef<HTMLDivElement>(null);
    const lastTap = useRef<number>(0);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Ensure overlays always start at the very top (scrollTop = 0)
    useEffect(() => {
      if (isRecreateOpen && recreateOverlayRef.current) {
        recreateOverlayRef.current.scrollTop = 0;
        requestAnimationFrame(() => {
          if (recreateOverlayRef.current) {
            recreateOverlayRef.current.scrollTop = 0;
          }
        });
      }
    }, [isRecreateOpen]);

    useEffect(() => {
      if (isMenuOpen && menuOverlayRef.current) {
        menuOverlayRef.current.scrollTop = 0;
        requestAnimationFrame(() => {
          if (menuOverlayRef.current) {
            menuOverlayRef.current.scrollTop = 0;
          }
        });
      }
    }, [isMenuOpen]);

    // Close menu or recreate overlay on click outside card
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
          if (isMenuOpen) {
            closeMenu();
          }
          setIsRecreateOpen(false);
        }
      };

      if (isMenuOpen || isRecreateOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, [isMenuOpen, isRecreateOpen, closeMenu]);

    const handlePointerDown = () => {
      longPressTimer.current = setTimeout(() => {
        haptic.medium();
        setIsLifted(true);
        setActiveMenuId(post.id);
      }, 350);
    };

    const handlePointerUpOrLeave = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      setIsLifted(false);
    };

    const handleImageClick = (e: React.MouseEvent<HTMLElement>) => {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        // Double-tap like
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setBurstPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setShowBurst(true);
        haptic.light();

        if (!isLiked) {
          setIsLiked(true);
          setLikesCount((prev) => prev + 1);
          toggleLike(post.id);
        }
      }
      lastTap.current = now;
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      haptic.light();

      const next = !isLiked;
      setIsLiked(next);
      setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
      if (next) {
        setShowBurst(true);
        setBurstPos(undefined);
      }
      await toggleLike(post.id);
    };

    const ratio = post.aspectRatio || 0.8;

    return (
      <div className="flex flex-col gap-1.5 w-full [content-visibility:auto] [contain-intrinsic-size:260px]">
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUpOrLeave}
          onPointerCancel={handlePointerUpOrLeave}
          className="group relative w-full rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xs transition-opacity duration-200"
          style={{ aspectRatio: `${ratio}`, borderRadius: '16px' }}
        >
          {/* Main Card Image with Double-Tap */}
          <Link
            href={`/post/${post.id}`}
            onClick={handleImageClick}
            className="block relative w-full h-full"
            aria-label={`Look by ${post.author?.username || post.username}: ${post.caption}`}
          >
            <Image
              src={post.image || post.image_url}
              alt={post.caption}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 200px"
              className="object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
              style={{ viewTransitionName: `post-${post.id}` }}
            />

            {/* Soft gradient bottom scrim for contrast */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Double-tap burst */}
            {showBurst && (
              <HeartBurst
                x={burstPos?.x}
                y={burstPos?.y}
                onComplete={() => setShowBurst(false)}
              />
            )}
          </Link>

          {/* Action Buttons - Icons Only */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-30">
            {/* Heart */}
            <button
              type="button"
              onClick={handleLikeClick}
              aria-label={isLiked ? "Unlike post" : "Like post"}
              className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-xl backdrop-saturate-180 border transition-all duration-200 active:scale-95 ${
                isLiked
                  ? "bg-[#FF7A8A]/80 border-[#FF7A8A]/50"
                  : "bg-white/15 border-white/20 hover:bg-white/25"
              }`}
            >
              <Heart
                size={16}
                fill={isLiked ? "currentColor" : "none"}
                className="text-white"
              />
            </button>

            {/* Recreate */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                haptic.medium();
                setIsRecreateOpen(true);
              }}
              aria-label="Recreate this look"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl backdrop-saturate-180 transition-all duration-200 active:scale-95"
            >
              <RefreshCw size={16} />
            </button>

            {/* Three-Dot */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                haptic.light();
                setActiveMenuId(isMenuOpen ? null : post.id);
              }}
              aria-label="More options"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl backdrop-saturate-180 transition-all duration-200 active:scale-95"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Three-Dots Menu Overlay (Light Milky Frosted Glass) */}
          {isMenuOpen && (
            <div
              ref={(el) => {
                menuOverlayRef.current = el;
                if (el) el.scrollTop = 0;
              }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full rounded-2xl z-50 animate-fade-in no-scrollbar"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
                background: 'rgba(255, 255, 255, 0.38)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                padding: '12px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="flex flex-col gap-1 w-full flex-1">
                {/* Menu Item 1: Save to Collection */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic.light();
                    closeMenu();
                    setIsSaveOpen(true);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#1a1a1a] hover:bg-black/10 active:scale-95 transition-all duration-200 ease-out flex items-center justify-center gap-2"
                >
                  <span className="text-base sm:text-lg">📌</span>
                  <span className="truncate">Save to Collection</span>
                </button>

                {/* Menu Item 2: Share */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic.light();
                    closeMenu();
                    if (navigator.share) {
                      navigator.share({ title: post.caption, url: window.location.href });
                    } else {
                      navigator.clipboard?.writeText(window.location.href);
                      showToast("Link copied to clipboard!");
                    }
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#1a1a1a] hover:bg-black/10 active:scale-95 transition-all duration-200 ease-out flex items-center justify-center gap-2"
                >
                  <span className="text-base sm:text-lg">🔗</span>
                  <span className="truncate">Share</span>
                </button>

                {/* Divider */}
                <div className="h-px bg-black/10 my-0.5" />

                {/* Menu Item 3: Report (danger variant) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic.light();
                    closeMenu();
                    showToast("Report submitted. Thank you.");
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#dc2626] hover:bg-red-500/10 active:scale-95 transition-all duration-200 ease-out flex items-center justify-center gap-2"
                >
                  <span className="text-base sm:text-lg">⚠️</span>
                  <span className="truncate">Report</span>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#1a1a1a] hover:bg-black/5 mt-auto active:scale-95 transition-transform flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Matched Wardrobe Pieces Overlay (In-Card Light Milky Glass) */}
          {isRecreateOpen && (
            <div
              ref={(el) => {
                recreateOverlayRef.current = el;
                if (el) el.scrollTop = 0;
              }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full rounded-2xl z-50 animate-fade-in no-scrollbar"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
                background: 'rgba(255, 255, 255, 0.38)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                padding: '12px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {/* Header */}
              <h3 
                className="text-[#1a1a1a] font-bold text-xs tracking-tight uppercase flex-shrink-0"
                style={{ marginBottom: '8px', flexShrink: 0 }}
              >
                MATCHED WARDROBE PIECES
              </h3>

              {/* Scrollable Items Container */}
              <div 
                className="flex flex-col gap-1.5 w-full flex-1"
                style={{ boxSizing: 'border-box', minHeight: 0 }}
              >
                {[
                  { id: 1, type: 'White Shirt', fit: 'Minimal', image: '/mock/shirt.jpg', matchPercentage: 94 },
                  { id: 2, type: 'Cream Pants', fit: 'Minimal Fit', image: '/mock/pants.jpg', matchPercentage: 88 },
                  { id: 3, type: 'White Shoes', fit: 'Minimal', image: '/mock/shoes.jpg', matchPercentage: 91 },
                ].map((piece) => (
                  <div
                    key={piece.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      borderRadius: '12px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                    className="shadow-xs hover:bg-white/90 transition-colors"
                  >
                    {/* Thumbnail - 32px x 32px */}
                    <div 
                      className="relative rounded-lg bg-[#9CA763]/25 overflow-hidden flex items-center justify-center text-xs font-bold text-[#1a1a1a]"
                      style={{ width: '32px', height: '32px', flexShrink: 0 }}
                    >
                      {piece.image ? (
                        <Image
                          src={piece.image}
                          alt={piece.type}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        piece.type.charAt(0)
                      )}
                    </div>

                    {/* Middle Text - Truncate cleanly */}
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <p className="text-[#1a1a1a] text-xs font-bold truncate leading-tight">
                        {piece.type}
                      </p>
                      <p className="text-[#555] text-[10px] font-medium truncate leading-tight">
                        {piece.fit}
                      </p>
                    </div>

                    {/* Percentage Badge - Never Clipped */}
                    <span 
                      className="text-[#1a1a1a] text-xs font-bold whitespace-nowrap"
                      style={{ flexShrink: 0 }}
                    >
                      {piece.matchPercentage}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div 
                className="flex gap-2 flex-shrink-0"
                style={{ marginTop: '8px', flexShrink: 0, width: '100%' }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRecreateOpen(false);
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/10 text-[#1a1a1a] text-xs font-medium hover:bg-black/20 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRecreateOpen(false);
                    showToast("Outfit recreated!");
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#9CA763] text-white text-xs font-medium hover:bg-[#8B964F] transition-all active:scale-95 shadow-xs"
                >
                  Recreate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info - locked height & positioning */}
        <div className="flex items-center justify-between px-1 text-xs h-5 min-h-[20px] max-h-5 shrink-0 overflow-hidden">
          <Link
            href={`/profile/${(post.author?.username || post.username || "").replace(/^u\//, "")}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-[var(--text)] tracking-tight truncate max-w-[110px] hover:underline hover:text-[var(--accent)] transition-colors"
          >
            {post.author?.username || post.username}
          </Link>
          <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0">
            {likesCount} likes
          </span>
        </div>

        <CollectionsSheet
          isOpen={isSaveOpen}
          onClose={() => setIsSaveOpen(false)}
          postId={post.id}
        />
      </div>
    );
  }
);
