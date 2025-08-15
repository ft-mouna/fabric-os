"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DynamicContainer from "@/container/DynamicContainer";
import { DynamicStateProvider } from "@/container/GlobalState";
import { ThemeContext } from "@/sample/common/ThemeWrapper";

interface AppLayouts {
  journeylayouts: {
    applicationlayouts: Record<string, { path: string; layout: any }>
  }
}

export default function AppDashboardPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const [layout, setLayout] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const mod: AppLayouts = (await import("@/configs/journeys/app.layouts.json")).default as any;
        const list = mod?.journeylayouts?.applicationlayouts || {};
        // Resolve by matching path: expect entries like path: "app/uam-maker"
        const match = Object.values(list).find((v: any) => v?.path === `app/${slug}`);
        if (mounted) setLayout(match?.layout?.layoutConfig || match?.layout || null);
      } catch (e) {
        console.error("Failed to load app layouts", e);
        if (mounted) setLayout(null);
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug]);

  const title = useMemo(() => slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), [slug]);

  return (
    <ThemeContext.Provider value={{ logo: "/images/logo.svg" }}>
      <DynamicStateProvider>
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
          <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-black/10 bg-white/70">
            <div className="mx-auto px-4">
              <div className="flex h-14 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" />
                  <span className="text-sm font-semibold tracking-wide text-black/90">{title}</span>
                </div>
                <nav className="hidden md:flex items-center gap-1 text-sm">
                  <a href="/roles" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Roles</a>
                  <a href="/layout-builder" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Layout Builder</a>
                  <a href="/demo" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Demo</a>
                </nav>
                <div className="md:hidden text-black/70 text-sm">Menu</div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">
            <div className="mt-4 border border-gray-200 rounded-lg">
              {layout ? (
                <DynamicContainer container={layout as any} />
              ) : (
                <div className="p-4 text-sm text-gray-600">No layout configured for <span className="font-mono">{slug}</span>.</div>
              )}
            </div>
          </main>
        </div>
      </DynamicStateProvider>
    </ThemeContext.Provider>
  );
}
