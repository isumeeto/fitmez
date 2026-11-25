"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Check,
  Shield,
  Palette,
  Shuffle,
  Sun,
  Moon,
  Laptop,
  Vibrate,
  Sparkles,
  X,
} from "lucide-react";
import { getProfile, updateProfile } from "@/lib/social";
import { signOut, saveSession, getSession } from "@/lib/auth";
import { BackButton } from "@/components/BackButton";
import { Avatar, PRESET_ORBS } from "@/components/Avatar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useToast } from "@/components/Toast";
import { getStoredTheme, applyTheme, ThemeMode } from "@/lib/theme";
import { haptic } from "@/lib/haptics";
import { Pressable } from "@/components/Pressable";

export default function EditProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [orbSeed, setOrbSeed] = useState(PRESET_ORBS[0]);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [brandFont, setBrandFont] = useState<"mystique" | "legacy">("mystique");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const prof = await getProfile();
      setUsername(prof.username.replace(/^u\//, ""));
      setBio(prof.bio);
      setIsAnonymous(prof.is_anonymous);
      if (prof.avatar_gradient) {
        setOrbSeed(prof.avatar_gradient);
      } else {
        setOrbSeed(prof.username.replace(/^u\//, "") || PRESET_ORBS[0]);
      }

      setThemeMode(getStoredTheme());
      const storedHaptics = localStorage.getItem("dripcheck_haptics");
      setHapticsEnabled(storedHaptics !== "false");

      const storedFont = localStorage.getItem("fitmez_brand_font");
      if (storedFont === "legacy" || storedFont === "mystique") {
        setBrandFont(storedFont);
      }
    }
    load();
  }, []);

  const handleBrandFontChange = (font: "mystique" | "legacy") => {
    haptic.light();
    setBrandFont(font);
    localStorage.setItem("fitmez_brand_font", font);
    document.documentElement.setAttribute("data-brand-font", font);
    showToast(`Brand font set to ${font === "mystique" ? "Mystique" : "Legacy"}`, "info");
  };

  const handleThemeChange = (mode: string) => {
    haptic.light();
    const newTheme = mode as ThemeMode;
    setThemeMode(newTheme);
    applyTheme(newTheme);
  };

  const handleHapticsToggle = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem("dripcheck_haptics", next ? "true" : "false");
    if (next) haptic.success();
  };

  const handleShuffleOrb = () => {
    haptic.light();
    const randomPreset = PRESET_ORBS[Math.floor(Math.random() * PRESET_ORBS.length)];
    const uniqueSeed = `${randomPreset}_${Math.floor(Math.random() * 100)}`;
    setOrbSeed(uniqueSeed);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    haptic.medium();
    try {
      const formattedUsername = `u/${username.trim().replace(/^u\//, "") || "anon"}`;
      await updateProfile({
        username: formattedUsername,
        bio: bio.trim(),
        is_anonymous: isAnonymous,
        avatar_gradient: orbSeed,
      });

      // Keep auth session updated
      const currentSession = getSession();
      if (currentSession) {
        saveSession({
          ...currentSession,
          username: formattedUsername,
        });
      }

      showToast("Profile settings saved!", "success");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    haptic.medium();
    await signOut();
    showToast("Signed out successfully", "info");
    router.replace("/login");
  };

  return (
    <div className="min-h-full max-w-[430px] mx-auto px-4 pt-3 pb-20 flex flex-col animate-fade-in bg-[var(--bg)]">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <BackButton fallbackUrl="/profile" />
        <h1 className="font-display font-bold text-sm text-[var(--text)] tracking-tight">
          Profile Settings
        </h1>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          aria-label="Close settings"
          className="w-11 h-11 flex items-center justify-center rounded-full glass text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all border border-[var(--border)] shadow-xs touch-press focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <X className="w-5 h-5 stroke-[1.75]" />
        </button>
      </header>

      <form onSubmit={handleSave} className="space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Avatar Orb Generator & Presets */}
          <div className="flex flex-col items-center gap-3 p-4 rounded-[26px] bg-[var(--surface)] border border-[var(--border)] shadow-xs">
            <div className="relative">
              <Avatar seed={orbSeed} size="xl" animateDrift={true} />
              <button
                type="button"
                onClick={handleShuffleOrb}
                aria-label="Shuffle avatar orb"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--accent-line)] shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-xs font-bold text-[var(--text)]">
                Gradient Orb Generator
              </span>
            </div>

            {/* 8 Preset Orbs */}
            <div className="grid grid-cols-4 gap-2 pt-1 w-full max-w-xs">
              {PRESET_ORBS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setOrbSeed(preset);
                  }}
                  className={`p-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    orbSeed === preset
                      ? "ring-2 ring-[var(--accent)] bg-[var(--accent-tint)]"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`Select ${preset} preset`}
                >
                  <Avatar seed={preset} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector (Segmented Control) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase block px-1">
              App Appearance
            </label>
            <SegmentedControl
              options={[
                { id: "system", label: "System", icon: Laptop },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "light", label: "Light", icon: Sun },
              ]}
              value={themeMode}
              onChange={handleThemeChange}
            />
          </div>

          {/* Brand Wordmark Font (Mystique vs Legacy) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase block">
                Brand Logo Font
              </label>
              <span className="text-[10px] text-[var(--accent)] font-bold">
                {brandFont === "mystique" ? "Mystique (Editorial)" : "Legacy (Bold Serif)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleBrandFontChange("mystique")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                  brandFont === "mystique"
                    ? "bg-[var(--surface-2)] border-[var(--accent-line)] ring-1 ring-[var(--accent-line)] shadow-sm"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                <span className="font-brand-mystique text-2xl tracking-[0.16em] uppercase text-[var(--text)] block pt-1">
                  FITMEZ
                </span>
                <div>
                  <span className="text-xs font-bold text-[var(--text)] block">
                    Mystique
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                    Haute couture editorial serif
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleBrandFontChange("legacy")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                  brandFont === "legacy"
                    ? "bg-[var(--surface-2)] border-[var(--accent-line)] ring-1 ring-[var(--accent-line)] shadow-sm"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                <span className="font-brand-legacy text-xl tracking-[0.06em] font-extrabold uppercase text-[var(--text)] block pt-1">
                  FITMEZ
                </span>
                <div>
                  <span className="text-xs font-bold text-[var(--text)] block">
                    Legacy
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                    Bold regal luxury serif
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Haptics Switch */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Vibrate className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="font-semibold text-xs text-[var(--text)] block">
                  Haptic Feedback
                </span>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                  Subtle vibrations on taps, likes, and scans
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hapticsEnabled}
                onChange={handleHapticsToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--surface-2)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent-line)] peer-checked:after:bg-[var(--btn-fg)]" />
            </label>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase block px-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)] select-none">
                u/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="style_curator"
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[var(--surface)] text-[var(--text)] text-xs font-semibold border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase block px-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell other dressers about your style ethos…"
              className="w-full p-3 rounded-2xl bg-[var(--surface)] text-[var(--text)] text-xs border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Anonymous mode toggle */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="font-semibold text-xs text-[var(--text)] block">
                  Anonymous Mode
                </span>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                  Only your handle and curated fits are shown
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--surface-2)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent-line)] peer-checked:after:bg-[var(--btn-fg)]" />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 px-4 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs font-bold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
            ) : (
              <span>Save Changes</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-full bg-[var(--danger)]/10 hover:bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2]" />
            <span>Sign Out</span>
          </button>
        </div>
      </form>
    </div>
  );
}
