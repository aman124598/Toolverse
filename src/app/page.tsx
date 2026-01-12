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
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

// Popular tools to showcase
const popularTools = [
  { slug: 'compress-pdf', name: 'Compress PDF', icon: '📄', desc: 'Reduce PDF file size', gradient: 'from-rose-500 to-orange-500' },
  { slug: 'merge-pdf', name: 'Merge PDF', icon: '📑', desc: 'Combine multiple PDFs', gradient: 'from-blue-500 to-indigo-500' },
  { slug: 'password-generator', name: 'Password Generator', icon: '🔐', desc: 'Create secure passwords', gradient: 'from-violet-500 to-purple-600' },
  { slug: 'word-counter', name: 'Word Counter', icon: '📊', desc: 'Count words & characters', gradient: 'from-blue-500 to-cyan-500' },
  { slug: 'json-formatter', name: 'JSON Formatter', icon: '{ }', desc: 'Format & validate JSON', gradient: 'from-amber-500 to-orange-500' },
  { slug: 'color-picker', name: 'Color Picker', icon: '🎨', desc: 'Pick & convert colors', gradient: 'from-pink-500 to-rose-500' },
  { slug: 'emi-calculator', name: 'EMI Calculator', icon: '🏦', desc: 'Calculate loan EMI', gradient: 'from-emerald-500 to-teal-500' },
  { slug: 'unit-converter', name: 'Unit Converter', icon: '📐', desc: 'Convert 100+ units', gradient: 'from-indigo-500 to-violet-500' },
];

// Feature boxes
const features = [
  { title: 'No Sign-up Required', desc: 'Start using any tool instantly without creating an account', icon: '🚀' },
  { title: 'Privacy Focused', desc: 'All processing happens in your browser. Files never leave your device', icon: '🔒' },
  { title: 'Completely Free', desc: 'All tools are free to use with no hidden charges or limits', icon: '💎' },
  { title: 'Works Offline', desc: 'Most tools work without internet after the page loads', icon: '📡' },
];

// Tool categories for quick access
const categories = [
  { name: 'PDF Tools', count: 23, icon: '📄', gradient: 'from-rose-500 to-orange-500' },
  { name: 'Calculators', count: 15, icon: '🔢', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Text Tools', count: 6, icon: '📝', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Generators', count: 5, icon: '⚡', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Code Tools', count: 4, icon: '💻', gradient: 'from-indigo-500 to-violet-500' },
  { name: 'Design Tools', count: 2, icon: '🎨', gradient: 'from-fuchsia-500 to-purple-500' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation - Fixed & Compact */}
        {/* Navigation - Floating Glass Pill */}
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
          <div className="relative w-full max-w-4xl rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/10 shadow-lg shadow-purple-500/10">
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center justify-between px-6 py-3">
              <Link href="/" className="font-bold text-xl tracking-tight hover:text-gray-300 transition-colors">
                Toolverse
              </Link>
              <Link 
                href="/tools" 
                className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded-full font-medium transition-all hover:scale-105 active:scale-95"
              >
                All Tools
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-28 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">55+ Free Tools • No Sign-up Required</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Every tool you need
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                in one place
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Free online tools for PDFs, calculations, text formatting, code formatting, and more. 
              No signup. No limits. Just tools that work.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/tools"
                className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-200 transition-all hover:scale-105"
              >
                Explore All Tools
              </Link>
              <Link
                href="#popular"
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                View Popular Tools
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Tools Section */}
        <section id="popular" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Tools</h2>
              <p className="text-gray-400">Most used tools by our community</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTools.map((tool) => (
                <Link key={tool.slug} href={`/${tool.slug}`}>
                  <SpotlightCard className="group h-full">
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                      </div>
                      <h3 className="font-semibold text-lg text-white mb-1">{tool.name}</h3>
                      <p className="text-sm text-gray-400">{tool.desc}</p>
                    </div>
                  </SpotlightCard>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link 
                href="/tools" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                View all 55+ tools
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-6 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
              <p className="text-gray-400">Find the right tool for your needs</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Link key={cat.name} href="/tools">
                  <SpotlightCard className="group">
                    <div className="p-6 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">{cat.name}</h3>
                        <p className="text-sm text-gray-400">{cat.count} tools</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </SpotlightCard>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Toolverse?</h2>
              <p className="text-gray-400">Built for simplicity and speed</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <SpotlightCard>
              <div className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Browse our complete collection of free online tools and find the perfect one for your task.
                </p>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold text-lg hover:opacity-90 transition-all"
                >
                  Explore All Tools
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="font-bold text-xl mb-2">Toolverse</div>
                <p className="text-sm text-gray-400">Free online tools for everyone</p>
              </div>
              <div className="flex items-center gap-8 text-sm text-gray-400">
                <Link href="/tools" className="hover:text-white transition-colors">All Tools</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
              © 2026 Toolverse. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
