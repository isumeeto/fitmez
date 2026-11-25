"use client";

import React, { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { initThemeListener } from "@/lib/theme";

import { MenuProvider } from "@/lib/MenuContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = initThemeListener();
    return () => cleanup();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <MenuProvider>
        {children}
      </MenuProvider>
    </MotionConfig>
  );
}
