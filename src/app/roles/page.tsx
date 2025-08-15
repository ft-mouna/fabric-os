"use client";

import React, { useEffect, useState } from "react";
import DynamicContainer from "@/container/DynamicContainer";
import { DynamicStateProvider } from "@/container/GlobalState";
import { ThemeContext } from "@/sample/common/ThemeWrapper";

export default function RolesPage() {
  const [containerConfig, setContainerConfig] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const appLayouts = (await import("@/configs/journeys/app.layouts.json")).default as any;
        const rolesNode = appLayouts?.journeylayouts?.applicationlayouts?.["roles"];
        const rolesLayout = rolesNode?.layout?.layoutConfig || rolesNode?.layout || null;
        if (mounted) setContainerConfig(rolesLayout);
      } catch (e) {
        console.error("Failed to load app layouts for roles", e);
        if (mounted) setContainerConfig(null);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <ThemeContext.Provider value={{ logo: "/images/logo.svg" }}>
      <DynamicStateProvider>
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
          <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-black/10 bg-white/70">
            <div className="mx-auto px-4">
              <div className="flex h-14 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" />
                  <span className="text-sm font-semibold tracking-wide text-black/90">Roles Dashboard</span>
                </div>
                <nav className="hidden md:flex items-center gap-1 text-sm">
                  <a href="/" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Home</a>
                  <a href="/layout-builder" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Layout Builder</a>
                  <a href="/demo" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Demo</a>
                </nav>
                <div className="md:hidden text-black/70 text-sm">Menu</div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">
            <h2 className="text-2xl font-semibold text-blue-950 text-center">Roles</h2>
            <div className="mt-4 border border-gray-200 rounded-lg">
              {containerConfig ? (
                <DynamicContainer container={containerConfig as any} />
              ) : (
                <div className="p-4 text-sm text-gray-600">Loading...</div>
              )}
            </div>
          </main>
        </div>
      </DynamicStateProvider>
    </ThemeContext.Provider>
  );
}
