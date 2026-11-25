"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";
import { getSession } from "@/lib/auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
    } else {
      queueMicrotask(() => {
        setIsAuthenticated(true);
      });
    }
  }, [router, pathname]);

  // Brief initial check prevents flash of protected content
  if (isAuthenticated === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        {/* Liquid glass top bar */}
        <TopBar />

        {/* Scrollable page container underneath floating bars */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar w-full">
          {children}
        </main>

        {/* Liquid glass floating bottom nav */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
