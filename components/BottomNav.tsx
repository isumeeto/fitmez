"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Plus, Sparkles, User } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { STYLIST_TAB_LABEL } from "@/lib/constants";

const NAV_ITEMS = [
  { id: "home",    label: "Home",            route: "/",        icon: Home },
  { id: "search",  label: "Search",          route: "/search",  icon: Search },
  { id: "create",  label: "Create",          route: "/create",  icon: Plus },
  { id: "stylist", label: STYLIST_TAB_LABEL, route: "/stylist", icon: Sparkles },
  { id: "profile", label: "Profile",         route: "/profile", icon: User },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Find active index based on current path
  const matchedIndex = NAV_ITEMS.findIndex((item) =>
    item.route === "/" ? pathname === "/" : pathname.startsWith(item.route)
  );
  const activeIndex = matchedIndex === -1 ? 0 : matchedIndex;

  // Hide nav on /create, /onboarding, /login, and full-screen flows
  if (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/create" ||
    pathname === "/stylist/upload" ||
    pathname.startsWith("/stylist/rate")
  ) {
    return null;
  }

  const handleTabPress = (route: string) => {
    haptic.light();
    startTransition(() => {
      router.push(route);
    });
  };

  return (
    <nav
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] left-0 right-0 max-w-[430px] mx-auto px-3 z-40 pointer-events-none select-none"
      aria-label="Main Navigation"
    >
      {/* Glass pill bar — 16px radius, same system as TopBar */}
      <div
        className="glass pointer-events-auto w-full h-[60px] relative flex items-center px-2"
        style={{
          borderRadius: "16px",
          border: "1px solid rgba(156, 167, 99, 0.20)",
          boxShadow:
            "0 8px 32px -8px rgba(22, 24, 17, 0.50), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        <div className="relative w-full h-full grid grid-cols-5 items-center">
          {/* Pure CSS sliding active bubble indicator — no spring layout calculation errors */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 w-1/5 h-full flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `translateX(calc(${activeIndex} * 100%))`,
            }}
            aria-hidden="true"
          >
            <div
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center shadow-md"
              style={{
                background: "var(--bubble)",
                boxShadow:
                  "0 0 20px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.40)",
              }}
            />
          </div>

          {/* Tab buttons */}
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeIndex === idx;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabPress(item.route)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-[3px] focus:outline-none min-w-[44px] min-h-[44px] touch-press"
              >
                <div
                  className={`flex flex-col items-center justify-center gap-[3px] transition-transform duration-150 ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors duration-150 ${
                      isActive
                        ? "text-[var(--on-bubble)] stroke-[2.25]"
                        : "text-[var(--text-muted)] stroke-[1.75] hover:text-[var(--text)]"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-bold tracking-tight leading-none transition-colors duration-150 ${
                      isActive
                        ? "text-[var(--on-bubble)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
