"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Settings } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Avatar } from "./Avatar";
import { getSession } from "@/lib/auth";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const [username, setUsername] = useState<string>("u/capsule_curator");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const session = getSession();
    if (session?.username) {
      setUsername(session.username);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMainTab =
    pathname === "/" ||
    pathname === "/search" ||
    pathname === "/stylist" ||
    pathname === "/profile";

  if (!isMainTab) return null;

  return (
    <header className="fixed top-3 left-0 right-0 max-w-[430px] mx-auto px-3 z-40 pointer-events-none">
      <AnimatePresence initial={false}>
        <motion.div
          animate={{
            y: isVisible ? 0 : -72,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="w-full pointer-events-auto"
        >
          {/* Glass pill bar — 16px radius, Milk Honey tint, Matcha border */}
          <div
            className="glass h-13 px-4 flex items-center justify-between"
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(156, 167, 99, 0.20)",
              boxShadow:
                "0 8px 32px -8px rgba(22, 24, 17, 0.42), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {/* FITMEZ wordmark left */}
            <Link
              href="/"
              className="flex items-center gap-2 focus:outline-none touch-press group"
              aria-label={`${APP_NAME} home`}
            >
              <span className="font-brand text-[22px] tracking-[0.16em] uppercase text-[var(--text)] flex items-center gap-2 select-none transition-all group-hover:opacity-90">
                {/* Matcha dot accent */}
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block shrink-0"
                  style={{
                    boxShadow: "0 0 10px var(--accent-glow)",
                  }}
                />
                <span className="leading-none pt-0.5 font-normal">{APP_NAME}</span>
              </span>
            </Link>

            {/* Right Action: Settings button when on /profile, Avatar orb on other tabs */}
            {pathname === "/profile" ? (
              <Link
                href="/profile/edit"
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text)] hover:text-[var(--accent)] active:scale-90 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-line)] shadow-xs touch-press"
                aria-label="Open Settings"
              >
                <Settings className="w-5 h-5 stroke-[1.75]" />
              </Link>
            ) : (
              <Link
                href="/profile"
                className="rounded-full touch-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-line)]"
                aria-label="View profile"
              >
                <div
                  className="rounded-full"
                  style={{
                    padding: "2px",
                    background:
                      "linear-gradient(135deg, var(--accent), var(--accent-deep))",
                  }}
                >
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      background: "var(--bg)",
                      padding: "1.5px",
                    }}
                  >
                    <Avatar username={username} size="sm" />
                  </div>
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </header>
  );
};
