import { useState, useEffect } from "react";

export const dur = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
};

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const spring = {
  snappy:      { type: "tween" as const, duration: 0.2, ease: ease.out },
  soft:        { type: "tween" as const, duration: 0.25, ease: ease.out },
  bouncy:      { type: "tween" as const, duration: 0.2, ease: ease.out }, // no bounce/overshoot
  menuReveal:  { type: "tween" as const, duration: 0.2, ease: ease.out },
  navPill:     { type: "spring" as const, stiffness: 360, damping: 36, mass: 0.85 },
};

// Springs accept max 2 keyframes. Use tween with explicit times for multi-value sequences.
export function keyframeTransition(duration = 0.35) {
  return {
    type: "tween" as const,
    duration,
    ease: ease.out,
    times: [0, 1],
  };
}

/** Returns true when user has requested reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** React hook for respecting prefers-reduced-motion system setting */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return reduced;
}


