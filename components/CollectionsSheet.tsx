"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Folder } from "lucide-react";
import { SheetBottom } from "./SheetBottom";
import { Pressable } from "./Pressable";
import { Collection } from "@/lib/types";
import { getStoredCollections, createCollection, addToCollection } from "@/lib/social";
import { useToast } from "./Toast";
import { haptic } from "@/lib/haptics";

interface CollectionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const CollectionsSheet: React.FC<CollectionsSheetProps> = ({
  isOpen,
  onClose,
  postId,
}) => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newColName, setNewColName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCollections(getStoredCollections());
    }
  }, [isOpen]);

  const handleSelect = async (col: Collection) => {
    haptic.success();
    await addToCollection(col.id, postId);
    showToast(`Saved to "${col.name}"`);
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    haptic.success();
    const newCol = await createCollection(newColName.trim(), [postId]);
    setCollections((prev) => [newCol, ...prev]);
    setNewColName("");
    setIsCreating(false);
    showToast(`Created & saved to "${newCol.name}"`);
    onClose();
  };

  return (
    <SheetBottom isOpen={isOpen} onClose={onClose} title="Save to Collection">
      <div className="flex flex-col gap-3 pb-6">
        {/* Collection items list */}
        <div className="flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto no-scrollbar">
          {collections.map((col) => {
            const hasPost = col.postIds.includes(postId);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleSelect(col)}
                className="w-full px-4 py-3 rounded-2xl flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)]">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--text)] tracking-tight">
                      {col.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {col.postIds.length} looks
                    </p>
                  </div>
                </div>
                {hasPost && (
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>

        {/* New Collection Row / Form */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex gap-2 pt-2">
            <input
              type="text"
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="Collection name…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <Pressable
              type="submit"
              disabled={!newColName.trim()}
              className="px-4 py-2.5 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold disabled:opacity-50"
            >
              Create
            </Pressable>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="w-full py-3 px-4 rounded-2xl border border-dashed border-[var(--border-strong)] flex items-center justify-center gap-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-tint)] active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        )}
      </div>
    </SheetBottom>
  );
};
