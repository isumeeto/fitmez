'use client';

import { useState, useEffect } from 'react';
import { getPublicFeed } from '@/lib/social';
import { OutfitPost } from '@/lib/types';
import { FilterPill } from '@/components/home/FilterPill';
import { OutfitCard } from '@/components/home/OutfitCard';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'curated' | 'community'>('curated');
  const [posts, setPosts] = useState<OutfitPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPublicFeed(activeTab);
        if (isMounted) {
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  return (
    <div className="min-h-full bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 pt-16">
      <FilterPill activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="px-3.5 flex flex-col gap-4 pb-32 pt-2 max-w-[420px] mx-auto">
        {loading ? (
          <div className="text-center py-20 text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <span className="text-xs font-semibold tracking-wide">Loading styling stream...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)] text-xs font-medium">
            No looks in this stream yet.
          </div>
        ) : (
          posts.map((post, idx) => (
            <OutfitCard
              key={post.id}
              post={post}
              priority={idx === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
