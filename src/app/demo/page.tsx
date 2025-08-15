"use client";

import React, { useEffect, useMemo, useState } from "react";
import DynamicContainer from "../../container/DynamicContainer";
import { DynamicStateProvider } from "../../container/GlobalState";
import { ThemeContext } from "../../sample/common/ThemeWrapper";

type DemoOption = { slug: string; title: string; description: string };

const DEMOS: DemoOption[] = [
  { slug: "buttons.demo", title: "Buttons", description: "Button and ButtonGroup demo" },
  { slug: "topnav.demo", title: "Top Navigation", description: "Dynamic TopNav with icons and actions" }
];

export default function DemoPage() {
  const [selected, setSelected] = useState<string>(DEMOS[0].slug);
  const [containerConfig, setContainerConfig] = useState<any | null>(null);

  const selectedMeta = useMemo(() => DEMOS.find(d => d.slug === selected)!, [selected]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const mod = await import(`../../configs/components/${selected}.json`);
        if (mounted) setContainerConfig(mod.default ?? mod);
      } catch (e) {
        console.error("Failed to load demo JSON:", selected, e);
        if (mounted) setContainerConfig(null);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selected]);

  // Provide example client actions referenced by some demos
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refreshData = () => alert("Refreshed data (demo)");
      (window as any).appSignOut = () => alert("Signed out (demo)");
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ logo: "/images/logo.svg" }}>
      <DynamicStateProvider>
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
          {/* Header (same pattern as layout-builder) */}
          <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-black/10 bg-white/70">
            <div className="mx-auto px-4">
              <div className="flex h-14 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" />
                  <span className="text-sm font-semibold tracking-wide text-black/90">Fabric OS</span>
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

          {/* Main content */}
          <main className="mx-auto max-w-6xl px-4 py-6">
            <h2 className="text-2xl font-semibold text-blue-950 text-center">Component Demos</h2>
            <div className="flex justify-center mt-3">
              <label className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Choose component:</span>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm"
                >
                  {DEMOS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="text-center text-sm text-gray-600 mt-2">{selectedMeta.description}</p>

            <div className="mt-4 border border-gray-200 rounded-lg">
              {containerConfig ? (
                <DynamicContainer container={containerConfig as any} />
              ) : (
                <div className="p-4 text-sm text-gray-600">No demo loaded.</div>
              )}
            </div>
          </main>
        </div>
      </DynamicStateProvider>
    </ThemeContext.Provider>
  );
}
