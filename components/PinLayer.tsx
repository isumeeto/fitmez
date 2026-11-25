"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tag, X, Plus } from "lucide-react";
import { Pin } from "@/lib/types";
import { spring } from "@/lib/motion";
import { haptic } from "@/lib/haptics";

interface PinLayerProps {
  pins: Pin[];
  editable?: boolean;
  onAddPin?: (pin: Pin) => void;
  onRemovePin?: (index: number) => void;
  className?: string;
}

export const PinLayer: React.FC<PinLayerProps> = ({
  pins,
  editable = false,
  onAddPin,
  onRemovePin,
  className = "",
}) => {
  const [activePinIndex, setActivePinIndex] = useState<number | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [newCoords, setNewCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedType, setSelectedType] = useState("shirt");
  const [note, setNote] = useState("");

  const clothingTypes = ["shirt", "pants", "jacket", "shoes", "accessory"];

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || pins.length >= 6) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));

    haptic.light();
    setNewCoords({ x, y });
    setIsEditingNew(true);
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoords) return;

    haptic.success();
    onAddPin?.({
      x: newCoords.x,
      y: newCoords.y,
      type: selectedType,
      note: note.trim() || undefined,
    });

    setIsEditingNew(false);
    setNewCoords(null);
    setNote("");
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`absolute inset-0 z-20 ${
        editable ? "cursor-crosshair" : "pointer-events-none"
      } ${className}`}
    >
      {/* Existing Pins */}
      {pins.map((pin, idx) => {
        const isOpen = activePinIndex === idx;

        return (
          <div
            key={idx}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
          >
            {/* Glowing Accent Dot Pin */}
            <motion.button
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.85 }}
              transition={spring.snappy}
              onClick={(e) => {
                e.stopPropagation();
                haptic.light();
                setActivePinIndex(isOpen ? null : idx);
              }}
              className="relative w-6 h-6 rounded-full bg-[var(--surface-2)] border-2 border-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)] flex items-center justify-center text-[var(--accent)] select-none focus:outline-none"
              aria-label={`Tag pin: ${pin.type}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            </motion.button>

            {/* Popover Bubble */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={spring.snappy}
                  onClick={(e) => e.stopPropagation()}
                  className="glass absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-2xl whitespace-nowrap z-30 shadow-xl border border-[var(--border-strong)] flex items-center gap-2"
                >
                  <Tag className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[var(--text)] capitalize leading-tight">
                      {pin.type}
                    </span>
                    {pin.note && (
                      <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                        {pin.note}
                      </span>
                    )}
                  </div>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => onRemovePin?.(idx)}
                      className="ml-1 text-[var(--danger)] hover:opacity-80"
                      aria-label="Remove pin"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Editor Modal for adding pin */}
      <AnimatePresence>
        {isEditingNew && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-5 rounded-[28px] max-w-[300px] w-full flex flex-col gap-4 border border-[var(--border-strong)] shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-[var(--text)]">
                  Tag Garment
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingNew(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewPin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {clothingTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          selectedType === type
                            ? "bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--accent-line)]"
                            : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                    Note / Brand (optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Pleated trousers, vintage"
                    className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold shadow-xs active:scale-98 transition-all"
                >
                  Save Pin
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
