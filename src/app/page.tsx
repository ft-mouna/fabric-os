// Home page navigation

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Top Navigation */}
      {/* Using a lightweight header pattern inline to avoid extra imports */}
      <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-black/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" />
              <span className="text-sm font-semibold tracking-wide text-black/90">Fabric OS</span>
            </div>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <a href="/" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Home</a>
              <a href="/layout-builder" className="px-3 py-1.5 rounded-md hover:bg-black/[.04] text-black/80">Layout Builder</a>
            </nav>
            <div className="md:hidden text-black/70 text-sm">Menu</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4 py-20">
        <section className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-blue-950">Build dynamic UIs with Fabric</h1>
          <p className="mt-2 text-sm md:text-base text-blue-900/70">Use the Layout Builder to compose JSON-driven screens from registered components.</p>
        </section>

        <div className="mt-10 flex items-center justify-center">
          <a
            href="/layout-builder"
            className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm hover:shadow transition-shadow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Open Layout Builder
          </a>
        </div>
      </main>
    </div>
  );
}
