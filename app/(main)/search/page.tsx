"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon, X, History, TrendingUp, Sparkles } from "lucide-react";
import { Post } from "@/lib/types";
import { searchPosts } from "@/lib/social";
import { GlassSurface } from "@/components/GlassSurface";
import { MasonryGrid } from "@/components/MasonryGrid";
import { StyleTile } from "@/components/StyleTile";
import { PostCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { PullToRefresh } from "@/components/PullToRefresh";
import { MirrorIllustration } from "@/components/illustrations";
import { getMockImage } from "@/lib/mock/images";
import { haptic } from "@/lib/haptics";

const RECENT_SEARCHES_KEY = "dripcheck_recent_searches";

const TRENDING_TILES = [
  { label: "Quiet Luxury", image: getMockImage(1, 1.33), query: "Old money" },
  { label: "Tokyo Draping", image: getMockImage(7, 1.33), query: "Streetwear" },
  { label: "Linen Minimal", image: getMockImage(3, 1.33), query: "Minimal" },
  { label: "Nordic Tailoring", image: getMockImage(9, 1.33), query: "Formal" },
  { label: "Modular Tech", image: getMockImage(6, 1.33), query: "Techwear" },
  { label: "Vintage Flight", image: getMockImage(10, 1.33), query: "Vintage" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Minimal",
    "Wool trench",
    "Streetwear",
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) {
        setRecentSearches(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecent = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [
      clean,
      ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecent = (term: string) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Perform search whenever query or selectedVibe change
  useEffect(() => {
    const hasFilters = query.trim() || selectedVibe;

    if (!hasFilters) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const vibes = selectedVibe ? [selectedVibe] : [];

    searchPosts(query, vibes)
      .then((found) => {
        setResults(found);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, selectedVibe]);

  const handleTileClick = (tileQuery: string) => {
    haptic.light();
    if (selectedVibe === tileQuery) {
      setSelectedVibe(null);
    } else {
      setSelectedVibe(tileQuery);
      saveRecent(tileQuery);
    }
  };

  const isFiltering = Boolean(query.trim() || selectedVibe);

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="min-h-full px-4 pt-18 pb-28 animate-fade-in flex flex-col gap-4">
        {/* Big Glass Search Input */}
        <div>
          <GlassSurface
            pill
            className="h-12 px-4 flex items-center gap-3 border border-[var(--border)] focus-within:border-[var(--accent-line)] focus-within:ring-1 focus-within:ring-[var(--accent-line)] shadow-sm"
          >
            <SearchIcon className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveRecent(query)}
              placeholder="Search aesthetics, cuts, fabrics…"
              className="w-full bg-transparent text-xs font-semibold text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </GlassSurface>
        </div>

        {/* When not filtering, show Recent Searches & Visual Trending Tiles */}
        {!isFiltering ? (
          <div className="flex flex-col gap-5 pt-1">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem(RECENT_SEARCHES_KEY);
                    }}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] normal-case font-semibold"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setQuery(term)}
                        className="focus:outline-none hover:text-[var(--accent)]"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecent(term)}
                        className="text-[var(--text-subtle)] hover:text-[var(--danger)] focus:outline-none ml-1"
                        aria-label={`Remove ${term}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Trending Tiles (Feature 8) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider px-1">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Trending Styles</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {TRENDING_TILES.map((tile) => (
                  <StyleTile
                    key={tile.label}
                    label={tile.label}
                    image={tile.image}
                    isSelected={selectedVibe === tile.query}
                    onClick={() => handleTileClick(tile.query)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Live Results View */
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
              <span>
                Found <span className="font-bold text-[var(--accent)]">{results.length}</span> looks
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedVibe(null);
                }}
                className="text-[11px] font-semibold text-[var(--text-subtle)] hover:text-[var(--text)] underline"
              >
                Reset filters
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PostCardSkeleton key={i} index={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={MirrorIllustration}
                title="Nothing yet"
                description="Nothing yet. Try searching for a different vibe or style."
                actionLabel="Reset Search"
                onAction={() => {
                  setQuery("");
                  setSelectedVibe(null);
                }}
                className="my-6"
              />
            ) : (
              <MasonryGrid posts={results} />
            )}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
