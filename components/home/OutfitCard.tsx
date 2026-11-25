'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark, Share2, Flame, Check, Tag } from 'lucide-react';
import { toggleLike, toggleSave } from '@/lib/social';

export interface OutfitPost {
  id: string;
  username: string;
  avatar?: string;
  image: string;
  caption: string;
  tags: string[];
  context: string; // e.g., "Streetwear • 18°C"
  likes: number;
  matchCount: number;
  liked: boolean;
  saved?: boolean;
  pins?: {
    top?: number;
    left?: number;
    name?: string;
    type?: string;
  }[];
}

interface OutfitCardProps {
  post: OutfitPost;
  priority?: boolean;
}

export function OutfitCard({ post, priority = false }: OutfitCardProps) {
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.saved ?? false);
  const [showClothingPins, setShowClothingPins] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showRecreate, setShowRecreate] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Single vs Double-tap handler
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double-tap detected: cancel single-tap timer and trigger like & burst animation
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      triggerDoubleTapLike();
    } else {
      // Single tap: toggle clothing pins after delay
      tapTimeoutRef.current = setTimeout(() => {
        setShowClothingPins((prev) => !prev);
      }, 300);
    }
    lastTapRef.current = now;
  };

  const triggerDoubleTapLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      toggleLike(post.id).catch(() => {});
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    toggleLike(post.id).catch(() => {});
  };

  const handleSave = () => {
    setIsSaved((prev) => !prev);
    toggleSave(post.id).catch(() => {});
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FITMEZ look by ${post.username}`,
          text: post.caption,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const pinsToDisplay = (post.pins && post.pins.length > 0)
    ? post.pins
    : [
        { top: 28, left: 35, name: 'Vintage Bomber' },
        { top: 62, left: 60, name: 'Cream Chinos' },
      ];

  const avatarInitial = post.avatar || post.username.charAt(0).toUpperCase();

  return (
    <article className="w-full max-w-[390px] mx-auto rounded-[28px] bg-[var(--surface)] border border-[var(--border)] p-4 shadow-sm flex flex-col gap-3 transition-all hover:border-[var(--border-strong)]">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Handle */}
        <Link
          href={`/profile/${post.username.replace(/^u\//, '')}`}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-line)] rounded-full touch-press"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] flex items-center justify-center text-[var(--on-accent)] text-sm font-extrabold shadow-xs group-hover:scale-105 transition-transform">
            {avatarInitial}
          </div>
          <div>
            <p className="text-sm font-bold font-display text-[var(--text)] leading-tight group-hover:underline">
              {post.username}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              @{post.username.toLowerCase().replace(/^u\//, '')}
            </p>
          </div>
        </Link>

        {/* Right: Context Pill */}
        <div className="px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--accent)] shadow-xs">
          {post.context}
        </div>
      </div>

      {/* Image Hero with Clothing Pins */}
      <div
        ref={imageRef}
        onClick={handleImageTap}
        className="relative w-full rounded-[22px] overflow-hidden border border-[var(--border-strong)] bg-[var(--surface-2)] cursor-pointer group shadow-xs select-none"
        style={{ aspectRatio: '4/5' }}
      >
        <Image
          src={post.image}
          alt={post.username}
          fill
          sizes="(max-width: 390px) 100vw, 390px"
          priority={priority}
          unoptimized={post.image.startsWith('data:') || post.image.endsWith('.svg')}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Clothing Pins (Toggle on Tap) */}
        <AnimatePresence>
          {showClothingPins && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute inset-0 pointer-events-none z-20"
            >
              {pinsToDisplay.map((pin, idx) => (
                <div
                  key={idx}
                  className="absolute px-3 py-1.5 rounded-full bg-[var(--surface-2)]/95 backdrop-blur-md text-xs font-semibold text-[var(--text)] border border-[var(--border-strong)] shadow-lg pointer-events-auto flex items-center gap-1.5 whitespace-nowrap"
                  style={{
                    top: `${pin.top ?? 40}%`,
                    left: `${pin.left ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span>{pin.name}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Like Burst Animation (on double-tap) */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, times: [0, 0.4, 1], ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <div className="relative flex items-center justify-center">
                <Heart
                  size={92}
                  className="text-[var(--like)] fill-[var(--like)] drop-shadow-[0_0_30px_rgba(255,122,138,0.85)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Floating Bar: Recreate Look (Left) & Tagged Pins (Right) - Never Overlapping */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 gap-2">
          {/* Recreate Look Pill */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowRecreate(true);
            }}
            style={{ borderRadius: '9999px' }}
            className="pointer-events-auto px-4 py-2 rounded-full glass border border-[var(--border-strong)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 hover:border-[var(--accent-line)] transition-all shadow-md cursor-pointer overflow-hidden backdrop-blur-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✨</span>
            <span>Recreate ({post.matchCount})</span>
          </motion.button>

          {/* Tagged Pins Toggle Pill */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowClothingPins((prev) => !prev);
            }}
            style={{ borderRadius: '9999px' }}
            className={`pointer-events-auto px-3.5 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 shadow-md cursor-pointer overflow-hidden backdrop-blur-md ${
              showClothingPins
                ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)]'
                : 'glass text-[var(--text)] border-[var(--border-strong)] hover:border-[var(--accent-line)]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tag size={12} />
            <span>{showClothingPins ? 'Hide Pins' : 'Tagged'}</span>
          </motion.button>
        </div>
      </div>

      {/* Action Capsule - Round Pill Shaped */}
      <div 
        className="glass rounded-full px-4 py-2 flex items-center gap-2.5 border border-[var(--border)] shadow-xs overflow-hidden"
        style={{ borderRadius: '9999px' }}
      >
        
        {/* Heart Button */}
        <motion.button
          type="button"
          onClick={handleLike}
          aria-label="Like post"
          style={{ borderRadius: '9999px' }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
            isLiked
              ? 'bg-[var(--like)]/20 text-[var(--like)] border border-[var(--like)]/40 shadow-xs'
              : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)]'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-xs font-bold">{likeCount}</span>
        </motion.button>

        {/* Rate Fit Button */}
        <motion.button
          type="button"
          onClick={() => setShowRating(true)}
          aria-label="Rate fit"
          style={{ borderRadius: '9999px' }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all border cursor-pointer ${
            userRating
              ? 'bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--accent-line)]'
              : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border-[var(--border)]'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <Flame size={16} className={userRating ? 'text-[var(--accent)]' : ''} />
          <span className="text-xs font-bold">
            {userRating ? `${userRating}★` : 'Rate'}
          </span>
        </motion.button>

        {/* Save Button */}
        <motion.button
          type="button"
          onClick={handleSave}
          aria-label="Save outfit"
          style={{ borderRadius: '9999px' }}
          className={`flex items-center justify-center w-8.5 h-8.5 rounded-full transition-all border cursor-pointer ${
            isSaved
              ? 'bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--accent-line)]'
              : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border-[var(--border)]'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Share Button */}
        <motion.button
          type="button"
          onClick={handleShare}
          aria-label="Share outfit"
          style={{ borderRadius: '9999px' }}
          className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all ml-auto border border-[var(--border)] cursor-pointer relative"
          whileTap={{ scale: 0.9 }}
        >
          {copied ? <Check size={15} className="text-[var(--success)]" /> : <Share2 size={15} />}
          {copied && (
            <span 
              style={{ borderRadius: '9999px' }}
              className="absolute -top-7 right-0 px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--success)] text-[10px] font-bold border border-[var(--border)] shadow-xs whitespace-nowrap"
            >
              Copied!
            </span>
          )}
        </motion.button>
      </div>

      {/* Caption with Tags */}
      <div className="text-sm text-[var(--text-muted)] px-1">
        <p className="mb-2 leading-relaxed">{post.caption}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-[var(--accent)] font-semibold hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showRating && (
          <RatingModal
            onClose={() => setShowRating(false)}
            onSubmit={(rating) => {
              setUserRating(rating);
              setShowRating(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRecreate && (
          <RecreateModal
            post={post}
            onClose={() => setShowRecreate(false)}
          />
        )}
      </AnimatePresence>
    </article>
  );
}

// Rating Modal Component
function RatingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (rating: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-0"
    >
      <motion.div
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[390px] rounded-t-[28px] bg-[var(--surface)] border-t border-x border-[var(--border-strong)] p-6 space-y-4 shadow-2xl"
      >
        <div className="w-12 h-1 rounded-full bg-[var(--border-strong)] mx-auto mb-2" />
        
        <div className="text-center">
          <h3 className="text-lg font-bold font-display text-[var(--text)]">
            Rate This Fit
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Tap a flame to score this community styling stream
          </p>
        </div>

        <div className="flex justify-center gap-3 py-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onSubmit(rating)}
              className="text-3xl hover:scale-125 active:scale-95 transition-transform p-2 cursor-pointer"
            >
              {rating <= 3 ? '🔥' : rating === 4 ? '🌟' : '👑'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// Recreate Modal Component
function RecreateModal({
  post,
  onClose,
}: {
  post: OutfitPost;
  onClose: () => void;
}) {
  const [recreated, setRecreated] = useState(false);

  const matchedPieces = [
    { type: 'White Shirt', fit: 'Minimal', match: 94 },
    { type: 'Cream Pants', fit: 'Minimal Fit', match: 88 },
    { type: 'Leather Loafers', fit: 'Classic', match: 82 },
  ];

  const handleRecreate = () => {
    setRecreated(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-0"
    >
      <motion.div
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[390px] rounded-t-[28px] bg-[var(--surface)] border-t border-x border-[var(--border-strong)] p-6 space-y-4 max-h-[75vh] overflow-y-auto shadow-2xl"
      >
        <div className="w-12 h-1 rounded-full bg-[var(--border-strong)] mx-auto mb-2" />
        
        <div>
          <h3 className="text-lg font-bold font-display text-[var(--text)]">
            Matched in Your Closet
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            MIW AI found {matchedPieces.length} items from your wardrobe matching @{post.username}
          </p>
        </div>

        <div className="space-y-2">
          {matchedPieces.map((piece, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {piece.type}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {piece.fit}
                </p>
              </div>
              <span className="text-sm font-bold text-[var(--accent)]">
                {piece.match}%
              </span>
            </div>
          ))}
        </div>

        {recreated ? (
          <div className="p-3 rounded-full bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30 text-center text-xs font-bold flex items-center justify-center gap-1.5">
            <Check size={16} /> Look added to your MIW AI Stylist board!
          </div>
        ) : (
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRecreate}
              className="flex-1 px-4 py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              Recreate
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
