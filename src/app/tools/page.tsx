'use client';

import { useState, useRef, MouseEvent } from 'react';
import Link from 'next/link';

// Aceternity-style Card with spotlight effect
function SpotlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

import { allTools } from '@/config/tools';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function ToolsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const defaultCategory = searchParams.get('category');
    if (defaultCategory && Object.keys(allTools).includes(defaultCategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategory(defaultCategory);
    }
  }, [searchParams]);

  const totalTools = Object.values(allTools).reduce((acc, cat) => acc + cat.tools.length, 0);

  // Filter tools based on search
  const getFilteredTools = () => {
    let filtered = Object.entries(allTools);

    if (selectedCategory) {
      filtered = filtered.filter(([name]) => name === selectedCategory);
    }

    return filtered.map(([categoryName, category]) => ({
      categoryName,
      ...category,
      tools: category.tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
          tool.desc.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      })
    })).filter(cat => cat.tools.length > 0);
  };

  const filteredCategories = getFilteredTools();
  const visibleToolsCount = filteredCategories.reduce((acc, cat) => acc + cat.tools.length, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-bold text-2xl tracking-tight hover:text-gray-300 transition-colors">
                Toolverse
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <section className="pt-16 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20 mb-4 inline-block">
                {totalTools} Free Tools
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                All Tools
              </h1>
              <p className="text-lg text-gray-400">
                Browse our complete collection of free online tools.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filters - Sticky */}
        <section className="sticky top-[65px] z-40 bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-2xl">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills - Scrollable */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
              >
                All Categories
              </button>
              {Object.entries(allTools).map(([cat, data]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === cat
                      ? `bg-gradient-to-r ${data.gradient} text-white shadow-lg`
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                >
                  <span>{data.icon}</span>
                  <span className="hidden sm:inline">{cat}</span>
                  <span className="sm:hidden">{cat.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Info */}
        {(search || selectedCategory) && (
          <div className="px-6 pt-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Found <span className="text-white font-medium">{visibleToolsCount}</span> tool{visibleToolsCount !== 1 ? 's' : ''}
                  {search && <span> matching &quot;<span className="text-purple-400">{search}</span>&quot;</span>}
                </p>
                {(search || selectedCategory) && (
                  <button
                    onClick={() => { setSearch(''); setSelectedCategory(null); }}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            {filteredCategories.length > 0 ? (
              <div className="space-y-16">
                {filteredCategories.map(({ categoryName, icon, gradient, desc, tools }) => (
                  <div key={categoryName}>
                    {/* Category Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-lg`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{categoryName}</h2>
                        <p className="text-sm text-gray-400 mt-1">{desc}</p>
                      </div>
                      <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                        {tools.length} tools
                      </span>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/${tool.slug}`}
                        >
                          <SpotlightCard className="group h-full hover:border-white/20 hover:scale-[1.02]">
                            <div className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-sm opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                                  {icon}
                                </div>
                              </div>
                              <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">{tool.name}</h3>
                              <p className="text-sm text-gray-500">{tool.desc}</p>
                            </div>
                          </SpotlightCard>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-24">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">No tools found</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any tools matching your search. Try different keywords or clear the filters.
                </p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory(null); }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="font-bold text-xl mb-1">Toolverse</div>
                <p className="text-sm text-gray-500">Free online tools for everyone</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-600">
              © 2026 Toolverse. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ToolsContent />
    </Suspense>
  );
}
