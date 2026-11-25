"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Check, X, Bookmark, Folder } from "lucide-react";
import { Collection, Post } from "@/lib/types";
import {
  getCollection,
  getFeed,
  updateCollectionName,
  deleteCollection,
} from "@/lib/social";
import { BackButton } from "@/components/BackButton";
import { MasonryGrid } from "@/components/MasonryGrid";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const collectionId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const col = await getCollection(collectionId);
        if (isMounted && col) {
          setCollection(col);
          setEditName(col.name);

          // Fetch all posts and filter by postIds
          const allPosts = await getFeed();
          const matched = allPosts.filter((p) => col.postIds.includes(p.id));
          setPosts(matched);
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
  }, [collectionId]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !collection) return;
    haptic.success();
    await updateCollectionName(collection.id, editName.trim());
    setCollection({ ...collection, name: editName.trim() });
    setIsEditing(false);
    showToast("Collection renamed");
  };

  const handleDelete = async () => {
    if (!collection) return;
    if (confirm(`Delete "${collection.name}"? This cannot be undone.`)) {
      haptic.medium();
      await deleteCollection(collection.id);
      showToast("Collection deleted");
      router.push("/profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full px-4 pt-4 pb-28 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" rounded="full" />
          <Skeleton className="w-36 h-5" rounded="full" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 pt-4">
          <Skeleton className="h-60" rounded="2xl" />
          <Skeleton className="h-60" rounded="2xl" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-full px-4 pt-16 pb-28 flex flex-col items-center justify-center">
        <EmptyState
          title="Collection not found"
          description="This moodboard may have been removed or renamed."
          actionLabel="Back to profile"
          onAction={() => router.push("/profile")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 pt-3 pb-28 flex flex-col space-y-5 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <BackButton fallbackUrl="/profile" />

        {isEditing ? (
          <form
            onSubmit={handleSaveName}
            className="flex-1 flex items-center gap-1.5 mx-2"
          >
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-2)] text-xs font-bold text-[var(--text)] border border-[var(--accent-line)] focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-fg)]"
              aria-label="Save name"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditName(collection.name);
                setIsEditing(false);
              }}
              className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]"
              aria-label="Cancel editing"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex-1 flex flex-col items-center text-center px-2">
            <h1 className="font-display font-bold text-base text-[var(--text)] tracking-tight truncate max-w-[200px]">
              {collection.name}
            </h1>
            <span className="text-[10px] text-[var(--text-muted)]">
              {posts.length} {posts.length === 1 ? "look" : "looks"} saved
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              onClick={() => {
                haptic.light();
                setIsEditing(true);
              }}
              aria-label="Rename collection"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-95 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDelete}
            aria-label="Delete collection"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--danger)] hover:opacity-80 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Collection Posts */}
      <div className="flex-1">
        {posts.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Empty collection"
            description="Looks you bookmark and save to this moodboard will appear here."
            actionLabel="Discover looks"
            onAction={() => router.push("/")}
            className="my-10"
          />
        ) : (
          <MasonryGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
