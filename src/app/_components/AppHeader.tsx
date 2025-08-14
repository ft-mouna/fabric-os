"use client";

import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-black/10 bg-white/70">
      <div className="mx-auto max-w-6xl px-4">
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
  );
}
