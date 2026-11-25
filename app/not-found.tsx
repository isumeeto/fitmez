import React from "react";
import Link from "next/link";
import { Sparkles, Home } from "lucide-react";
import { GlassSurface } from "@/components/GlassSurface";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center bg-[var(--bg)] relative overflow-hidden">
      {/* Background soft blur */}
      <div className="absolute top-[20%] left-[-10%] w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />

      <GlassSurface
        pill={false}
        className="p-8 max-w-xs w-full flex flex-col items-center shadow-lg border border-[var(--glass-border)]"
      >
        <div className="w-16 h-16 rounded-3xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 stroke-[1.8]" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-1">
          404 Error
        </span>

        <h1 className="text-xl font-bold text-[var(--text)] tracking-tight mb-2">
          Out of Style
        </h1>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
          The outfit, look, or page you were looking for doesn&apos;t exist in our wardrobe.
        </p>

        <Link
          href="/"
          className="touch-press w-full py-3 px-4 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-semibold shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </GlassSurface>

      <span className="text-[11px] text-[var(--text-muted)] mt-6 font-medium">
        {APP_NAME} — MIW AI Stylist
      </span>
    </div>
  );
}
