"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { componentRegistry } from "../../container/ComponentRegistry";
import ComponentDetails from "./ComponentDetails";

export default function LayoutBuilderDashboard() {
  const components = useMemo(() => Object.keys(componentRegistry), []);
  const [selectedKey, setSelectedKey] = useState<string | null>(components[0] ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-black/10 bg-white/70">
        <div className="mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" />
              <span className="text-sm font-semibold tracking-wide text-black/90">Fabric OS</span>
            </div>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Home</Link>
              <Link href="/layout-builder" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Layout Builder</Link>
            </nav>
            <div className="md:hidden text-black/70 text-sm">Menu</div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 flex h-[calc(100vh-56px)] flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 md:border-r border-blue-100/70 bg-white/70 backdrop-blur p-4 md:rounded-l-xl md:h-full md:overflow-auto">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-blue-900">Components</h2>
          </div>
          <nav className="flex flex-wrap md:flex-col gap-1">
            {components.map((key) => {
              const active = key === selectedKey;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={[
                    "text-left px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "hover:bg-blue-50 text-blue-900",
                  ].join(" ")}
                  title={key}
                >
                  <span className="font-medium">{key}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <section className="flex-1 p-4 md:p-8 h-full overflow-hidden flex flex-col min-h-0 min-w-0">
          <header className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-blue-950">Layout Builder</h1>
            <p className="text-xs md:text-sm text-blue-900/70">Dashboard</p>
          </header>

          <div className="flex-1 min-h-0">
            <ComponentDetails selectedKey={selectedKey} />
          </div>

          <div className="mt-6 md:mt-8">
            <Link href="/" className="text-sm text-blue-800 hover:underline">Back to Home</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
