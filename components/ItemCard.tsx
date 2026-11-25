"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Shirt, Footprints, Layers, Sparkles } from "lucide-react";
import { Item } from "@/lib/types";

interface ItemCardProps {
  item: Item;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (item: Item) => void;
}

export const ItemTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  const t = type.toLowerCase();
  if (t === "shoes") return <Footprints className={className} />;
  if (t === "jacket") return <Layers className={className} />;
  if (t === "accessory") return <Sparkles className={className} />;
  return <Shirt className={className} />;
};

export function getItemIcon(type: string) {
  const t = type.toLowerCase();
  if (t === "shirt") return Shirt;
  if (t === "shoes") return Footprints;
  if (t === "jacket") return Layers;
  if (t === "accessory") return Sparkles;
  return Shirt;
}

const ItemCardComponent: React.FC<ItemCardProps> = ({
  item,
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }
    onDelete?.(item.id);
  };

  return (
    <div
      onClick={() => selectable && onSelect?.(item)}
      className={`relative group rounded-3xl overflow-hidden bg-[var(--surface)] border transition-all duration-200 select-none ${
        selected
          ? "border-[var(--accent-line)] ring-2 ring-[var(--accent-line)] shadow-md"
          : "border-[var(--border)] shadow-xs hover:border-[var(--border-strong)]"
      } ${selectable ? "cursor-pointer active:scale-95" : ""}`}
    >
      {/* Image container */}
      <div className="relative w-full aspect-square bg-[var(--bg)] overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={`${item.color} ${item.type}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-subtle)] bg-[var(--surface)]">
            <ItemTypeIcon type={item.type} className="w-8 h-8 stroke-[1.75]" />
          </div>
        )}

        {/* Delete button (if onDelete supplied) */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            onMouseLeave={() => setShowConfirmDelete(false)}
            aria-label={showConfirmDelete ? "Confirm delete" : "Delete item"}
            className={`absolute top-2 right-2 rounded-full p-2 backdrop-blur-md transition-all duration-200 active:scale-90 ${
              showConfirmDelete
                ? "bg-[var(--danger)] text-white shadow-md scale-105"
                : "bg-black/50 text-white/90 hover:bg-black/70"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-semibold text-xs text-[var(--text)] capitalize tracking-tight truncate">
            {item.type}
          </span>
          <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-tint)] shrink-0">
            {item.color}
          </span>
        </div>

        {/* Additional tags if present */}
        <div className="flex items-center gap-1 overflow-hidden text-[10px] text-[var(--text-muted)] truncate">
          {item.style && <span className="capitalize">{item.style}</span>}
          {item.fit && <span>• {item.fit}</span>}
        </div>
      </div>
    </div>
  );
};

export const ItemCard = React.memo(ItemCardComponent);
