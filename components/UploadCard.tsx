"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon, X, RefreshCw } from "lucide-react";

interface UploadCardProps {
  previews: string[];
  onFilesSelected: (files: File[]) => void;
  onRemovePreview?: (index: number) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  previews,
  onFilesSelected,
  onRemovePreview,
  multiple = false,
  title = "Add photo",
  subtitle = "Take a photo or choose from library",
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload clothing image"
      />

      {previews.length === 0 ? (
        <button
          type="button"
          onClick={triggerUpload}
          className="touch-press w-full py-12 px-6 rounded-3xl border border-dashed border-[var(--border-strong)] hover:border-[var(--accent-line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] flex flex-col items-center justify-center text-center transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)]"
        >
          <div className="w-13 h-13 rounded-2xl bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6 stroke-[1.75]" />
          </div>
          <span className="font-bold text-sm text-[var(--text)] mb-1">
            {title}
          </span>
          <span className="text-xs text-[var(--text-muted)] max-w-xs">
            {subtitle}
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {previews.map((preview, idx) => (
              <div
                key={preview + idx}
                className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--bg)] border border-[var(--border)] group"
              >
                <Image
                  src={preview}
                  alt={`Upload preview ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
                {onRemovePreview && (
                  <button
                    type="button"
                    onClick={() => onRemovePreview(idx)}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={triggerUpload}
              className="touch-press flex-1 py-2.5 px-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] text-xs font-semibold flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)]"
            >
              {multiple ? (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Add another photo</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Replace photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
