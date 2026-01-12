'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
  const lines = text.split('\n').length;
  const readingTime = Math.ceil(words / 200);
  const speakingTime = Math.ceil(words / 150);

  const stats = [
    { label: 'Words', value: words, icon: '📝', color: 'from-purple-500 to-violet-500' },
    { label: 'Characters', value: characters, icon: '🔤', color: 'from-blue-500 to-cyan-500' },
    { label: 'Sentences', value: sentences, icon: '💬', color: 'from-emerald-500 to-teal-500' },
    { label: 'Paragraphs', value: paragraphs, icon: '📄', color: 'from-amber-500 to-orange-500' },
  ];

  const detailedStats = [
    { label: 'Characters (no spaces)', value: charactersNoSpaces },
    { label: 'Lines', value: lines },
    { label: 'Reading Time', value: `${readingTime} min` },
    { label: 'Speaking Time', value: `${speakingTime} min` },
    { label: 'Average Word Length', value: words > 0 ? (charactersNoSpaces / words).toFixed(1) : '0' },
    { label: 'Avg Words per Sentence', value: sentences > 0 ? (words / sentences).toFixed(1) : '0' },
  ];

  // Word frequency
  const wordFrequency = text.trim()
    ? text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2)
        .reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    : {};

  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Character distribution
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  const numberCount = (text.match(/[0-9]/g) || []).length;
  const spaceCount = (text.match(/\s/g) || []).length;
  const specialCount = characters - letterCount - numberCount - spaceCount;

  return (
    <ToolLayout
      title="Word Counter"
      description="Analyze text with detailed statistics and insights"
      icon={Icons.chart}
      gradient="from-blue-500 to-cyan-500"
    >
      {/* Text Input */}
      <div className="relative mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here to analyze..."
          className="w-full h-72 p-6 bg-black/20 border border-white/5 rounded-2xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        {text && (
          <button
            onClick={() => setText('')}
            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="relative overflow-hidden bg-black/20 rounded-2xl p-5 border border-white/5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {showDetails ? 'Hide' : 'Show'} Detailed Analysis
      </button>

      {showDetails && (
        <div className="space-y-6 animate-in slide-in-from-top-4">
          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {detailedStats.map((stat) => (
              <div key={stat.label} className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="text-lg font-semibold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Character Distribution */}
          {text.length > 0 && (
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Character Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Letters', value: letterCount, percent: (letterCount / characters * 100) || 0, color: 'bg-purple-500' },
                  { label: 'Numbers', value: numberCount, percent: (numberCount / characters * 100) || 0, color: 'bg-blue-500' },
                  { label: 'Spaces', value: spaceCount, percent: (spaceCount / characters * 100) || 0, color: 'bg-gray-500' },
                  { label: 'Special', value: specialCount, percent: (specialCount / characters * 100) || 0, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">{item.value} ({item.percent.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Words */}
          {topWords.length > 0 && (
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Most Used Words</h3>
              <div className="flex flex-wrap gap-2">
                {topWords.map(([word, count], i) => (
                  <span 
                    key={word} 
                    className="px-3 py-1.5 bg-white/5 rounded-lg text-sm border border-white/5"
                    style={{ fontSize: `${Math.max(12, 16 - i)}px` }}
                  >
                    {word} <span className="text-purple-400">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          disabled={!text}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Text
        </button>
        <button
          onClick={() => setText(text.toLowerCase())}
          disabled={!text}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
        >
          lowercase
        </button>
        <button
          onClick={() => setText(text.toUpperCase())}
          disabled={!text}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
        >
          UPPERCASE
        </button>
      </div>
    </ToolLayout>
  );
}
