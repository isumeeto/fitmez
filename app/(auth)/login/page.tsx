"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, UserCheck, ShieldCheck, Mail, Lock, AtSign } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { GlassSurface } from "@/components/GlassSurface";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Pressable } from "@/components/Pressable";
import { signIn, signUp, continueAsGuest, getSession } from "@/lib/auth";
import { haptic } from "@/lib/haptics";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace("/");
    }
  }, [router]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string; username?: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (tab === "signup") {
      const cleanUser = username.trim().replace(/^u\//, "");
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(cleanUser)) {
        newErrors.username = "Username must be 3–20 letters, numbers, or _";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    haptic.medium();
    setLoading(true);
    try {
      if (tab === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrors({ email: "Authentication failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    haptic.light();
    setGuestLoading(true);
    try {
      await continueAsGuest();
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-8 overflow-hidden bg-[var(--bg)]">
      {/* Drifting gradient mesh in brand colors */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.95, 1],
          rotate: [0, 90, 180, 360],
          opacity: [0.25, 0.45, 0.3, 0.25],
        }}
        transition={{
          type: "tween",
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full pointer-events-none blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, rgba(22,24,17,0.5) 50%, transparent 75%)",
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-sm relative z-10 animate-fade-in flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--accent-line)] shadow-[0_4px_24px_var(--accent-glow)] mb-3">
            <Sparkles className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="font-brand font-normal text-4xl tracking-[0.18em] uppercase text-[var(--text)]">
            {APP_NAME}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
            Your wardrobe, styled by MIW AI.
          </p>
        </div>

        {/* Auth Glass Container */}
        <GlassSurface
          pill={false}
          className="w-full p-6 border border-[var(--border)] shadow-xl"
        >
          {/* Segmented Control */}
          <SegmentedControl
            options={[
              { id: "signin", label: "Sign in" },
              { id: "signup", label: "Create account" },
            ]}
            value={tab}
            onChange={(val) => {
              setTab(val);
              setErrors({});
            }}
            className="mb-5"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase block pl-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full h-[50px] pl-10 pr-4 rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-xs border border-[var(--border)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-[var(--danger)] pl-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase block pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full h-[50px] pl-10 pr-4 rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-xs border border-[var(--border)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-[var(--danger)] pl-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Username Field on Sign Up */}
            {tab === "signup" && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">
                    Anonymous Handle
                  </label>
                  <span className="text-[10px] text-[var(--accent)] flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" /> Anonymous
                  </span>
                </div>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="capsule_minimalist"
                    className="w-full h-[50px] pl-10 pr-4 rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-xs border border-[var(--border)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] transition-all"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] pl-1">
                  Shown as <span className="font-semibold text-[var(--text)]">u/{username.replace(/^u\//, "") || "username"}</span>. No real name needed.
                </p>
                {errors.username && (
                  <p className="text-[10px] text-[var(--danger)] pl-1 font-medium">
                    {errors.username}
                  </p>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            <Pressable
              type="submit"
              disabled={loading || guestLoading}
              className="w-full h-[50px] px-4 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] font-display text-sm font-bold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-line)] disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--btn-fg)] border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>{tab === "signin" ? "Sign in" : "Create account"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                </>
              )}
            </Pressable>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-[var(--border)]" />
            <span className="absolute bg-[var(--surface)] px-2 text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider">
              or
            </span>
          </div>

          {/* Guest Button */}
          <Pressable
            type="button"
            onClick={handleGuest}
            disabled={loading || guestLoading}
            className="w-full h-[50px] px-4 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-bold border border-[var(--border)] transition-all flex items-center justify-center gap-2 focus:outline-none disabled:opacity-60"
          >
            {guestLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-[var(--text)] border-t-transparent animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-[var(--accent)] stroke-[2]" />
                <span>Continue as guest</span>
              </>
            )}
          </Pressable>
        </GlassSurface>

        {/* Security / Privacy reassurance */}
        <p className="text-center text-[11px] text-[var(--text-subtle)] mt-5">
          Anonymous by design • No phone number required
        </p>
      </div>
    </div>
  );
}
