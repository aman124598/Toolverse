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

// Complete tool directory organized by category
const allTools = {
  'PDF Conversion': {
    icon: '📄',
    gradient: 'from-red-500 to-orange-500',
    desc: 'Compress, merge, split and edit PDF files',
    tools: [
      { slug: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce file size', working: true },
      { slug: 'merge-pdf', name: 'Merge PDF', desc: 'Combine files', working: true },
      { slug: 'split-pdf', name: 'Split PDF', desc: 'Extract pages', working: true },
      { slug: 'rotate-pdf', name: 'Rotate PDF', desc: 'Rotate pages', working: true },
      { slug: 'delete-pdf-pages', name: 'Delete Pages', desc: 'Remove pages', working: false },
      { slug: 'reorder-pdf-pages', name: 'Reorder Pages', desc: 'Rearrange pages', working: false },
      { slug: 'add-page-number-to-pdf', name: 'Add Page Numbers', desc: 'Number pages', working: true },
      { slug: 'add-watermark-to-pdf', name: 'Add Watermark', desc: 'Watermark PDF', working: true },
      { slug: 'lock-pdf', name: 'Lock PDF', desc: 'Password protect', working: false },
      { slug: 'unlock-pdf', name: 'Unlock PDF', desc: 'Remove password', working: false },
    ]
  },
  'PDF to Other Formats': {
    icon: '🔄',
    gradient: 'from-orange-500 to-amber-500',
    desc: 'Convert PDF to Word, Excel, and more',
    tools: [
      { slug: 'pdf-to-word', name: 'PDF to Word', desc: 'Export to DOCX', working: false },
      { slug: 'pdf-to-excel', name: 'PDF to Excel', desc: 'Export to XLSX', working: false },
      { slug: 'pdf-to-ppt', name: 'PDF to PPT', desc: 'Export to PPTX', working: false },
      { slug: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Export to images', working: false },
      { slug: 'pdf-to-png', name: 'PDF to PNG', desc: 'Export to PNG', working: false },
      { slug: 'pdf-to-text', name: 'PDF to Text', desc: 'Extract text', working: false },
    ]
  },
  'Convert to PDF': {
    icon: '📥',
    gradient: 'from-amber-500 to-yellow-500',
    desc: 'Create PDF from various file formats',
    tools: [
      { slug: 'jpg-to-pdf', name: 'JPG to PDF', desc: 'Images to PDF', working: false },
      { slug: 'png-to-pdf', name: 'PNG to PDF', desc: 'PNG to PDF', working: false },
      { slug: 'word-to-pdf', name: 'Word to PDF', desc: 'DOCX to PDF', working: false },
      { slug: 'excel-to-pdf', name: 'Excel to PDF', desc: 'XLSX to PDF', working: false },
      { slug: 'ppt-to-pdf', name: 'PPT to PDF', desc: 'PPTX to PDF', working: false },
    ]
  },
  'Financial Calculators': {
    icon: '💰',
    gradient: 'from-emerald-500 to-teal-500',
    desc: 'Calculate loans, investments and taxes',
    tools: [
      { slug: 'emi-calculator', name: 'EMI Calculator', desc: 'Loan EMI', working: true },
      { slug: 'sip-calculator', name: 'SIP Calculator', desc: 'SIP returns', working: true },
      { slug: 'gst-calculator', name: 'GST Calculator', desc: 'GST amounts', working: true },
      { slug: 'fd-calculator', name: 'FD Calculator', desc: 'FD returns', working: false },
      { slug: 'rd-calculator', name: 'RD Calculator', desc: 'RD returns', working: false },
      { slug: 'ppf-calculator', name: 'PPF Calculator', desc: 'PPF returns', working: false },
    ]
  },
  'Text Tools': {
    icon: '📝',
    gradient: 'from-blue-500 to-cyan-500',
    desc: 'Format, count and transform text',
    tools: [
      { slug: 'word-counter', name: 'Word Counter', desc: 'Count words', working: true },
      { slug: 'case-converter', name: 'Case Converter', desc: 'Change case', working: true },
      { slug: 'text-to-slug', name: 'Text to Slug', desc: 'URL slugs', working: true },
      { slug: 'reverse-text', name: 'Reverse Text', desc: 'Flip text', working: true },
      { slug: 'remove-extra-spaces', name: 'Remove Spaces', desc: 'Clean text', working: true },
      { slug: 'find-replace-text', name: 'Find & Replace', desc: 'Search replace', working: true },
    ]
  },
  'Generators': {
    icon: '⚡',
    gradient: 'from-purple-500 to-pink-500',
    desc: 'Generate passwords, data and more',
    tools: [
      { slug: 'password-generator', name: 'Password Generator', desc: 'Secure passwords', working: true },
      { slug: 'qr-code-generator', name: 'QR Code Generator', desc: 'Create QR codes', working: false },
      { slug: 'data-generator', name: 'Fake Data Generator', desc: 'Test data', working: true },
    ]
  },
  'Code Tools': {
    icon: '💻',
    gradient: 'from-indigo-500 to-violet-500',
    desc: 'Format and minify code',
    tools: [
      { slug: 'json-formatter', name: 'JSON Formatter', desc: 'Format JSON', working: true },
      { slug: 'xml-formatter', name: 'XML Formatter', desc: 'Format XML', working: false },
      { slug: 'js-minifier', name: 'JS Minifier', desc: 'Minify JS', working: false },
      { slug: 'css-minifier', name: 'CSS Minifier', desc: 'Minify CSS', working: false },
    ]
  },
  'Calculators': {
    icon: '🔢',
    gradient: 'from-rose-500 to-pink-500',
    desc: 'Math, age, BMI and more calculators',
    tools: [
      { slug: 'simple-calculator', name: 'Calculator', desc: 'Basic math', working: true },
      { slug: 'age-calculator', name: 'Age Calculator', desc: 'Calculate age', working: true },
      { slug: 'bmi-calculator', name: 'BMI Calculator', desc: 'Body mass index', working: true },
      { slug: 'percentage-calculator', name: 'Percentage', desc: 'Percentages', working: true },
      { slug: 'discount-calculator', name: 'Discount', desc: 'Discounts', working: true },
    ]
  },
  'Design Tools': {
    icon: '🎨',
    gradient: 'from-fuchsia-500 to-purple-500',
    desc: 'Colors, units and design utilities',
    tools: [
      { slug: 'color-picker', name: 'Color Picker', desc: 'Pick colors', working: true },
      { slug: 'unit-converter', name: 'Unit Converter', desc: 'Convert units', working: true },
    ]
  },
};

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'working'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalTools = Object.values(allTools).reduce((acc, cat) => acc + cat.tools.length, 0);
  const workingTools = Object.values(allTools).reduce((acc, cat) => 
    acc + cat.tools.filter(t => t.working).length, 0
  );

  // Filter tools based on search and filters
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
        const matchesFilter = filter === 'all' || tool.working;
        return matchesSearch && matchesFilter;
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
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                  {workingTools} Live Tools
                </span>
                <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs font-medium rounded-full border border-white/10">
                  {totalTools} Total
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                All Tools
              </h1>
              <p className="text-lg text-gray-400">
                Browse our complete collection of free online tools. Search, filter, and find the perfect tool for your needs.
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

              {/* Filter Tabs */}
              <div className="flex items-center gap-3">
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'all' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All Tools
                  </button>
                  <button
                    onClick={() => setFilter('working')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      filter === 'working' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    Working Only
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills - Scrollable */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  !selectedCategory 
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
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat 
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
        {(search || filter !== 'all' || selectedCategory) && (
          <div className="px-6 pt-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Found <span className="text-white font-medium">{visibleToolsCount}</span> tool{visibleToolsCount !== 1 ? 's' : ''}
                  {search && <span> matching &quot;<span className="text-purple-400">{search}</span>&quot;</span>}
                </p>
                {(search || filter !== 'all' || selectedCategory) && (
                  <button
                    onClick={() => { setSearch(''); setFilter('all'); setSelectedCategory(null); }}
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
                          href={tool.working ? `/${tool.slug}` : '#'}
                          onClick={(e) => !tool.working && e.preventDefault()}
                        >
                          <SpotlightCard className={`group h-full hover:border-white/20 ${!tool.working ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>
                            <div className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-sm opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                                  {icon}
                                </div>
                                {tool.working ? (
                                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    Live
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">Soon</span>
                                )}
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
                  onClick={() => { setSearch(''); setFilter('all'); setSelectedCategory(null); }}
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
