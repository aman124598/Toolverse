'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function CaseConverterPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const conversions = [
    { 
      name: 'UPPERCASE', 
      desc: 'All letters in capitals',
      fn: (t: string) => t.toUpperCase(),
      icon: '⬆️'
    },
    { 
      name: 'lowercase', 
      desc: 'All letters in small',
      fn: (t: string) => t.toLowerCase(),
      icon: '⬇️'
    },
    { 
      name: 'Title Case', 
      desc: 'First letter of each word capitalized',
      fn: (t: string) => t.replace(/\b\w/g, c => c.toUpperCase()),
      icon: '📰'
    },
    { 
      name: 'Sentence case', 
      desc: 'First letter of sentence capitalized',
      fn: (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
      icon: '💬'
    },
    { 
      name: 'aLtErNaTiNg CaSe', 
      desc: 'Alternating upper and lower',
      fn: (t: string) => t.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join(''),
      icon: '🔀'
    },
    { 
      name: 'InVeRsE CaSe', 
      desc: 'Swap upper and lower',
      fn: (t: string) => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
      icon: '🔃'
    },
    { 
      name: 'snake_case', 
      desc: 'Words separated by underscores',
      fn: (t: string) => t.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
      icon: '🐍'
    },
    { 
      name: 'kebab-case', 
      desc: 'Words separated by hyphens',
      fn: (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      icon: '🍢'
    },
    { 
      name: 'camelCase', 
      desc: 'First word lowercase, rest capitalized',
      fn: (t: string) => t.replace(/(?:^\w|[A-Z]|\b\w)/g, (c, i) => i === 0 ? c.toLowerCase() : c.toUpperCase()).replace(/\s+/g, ''),
      icon: '🐪'
    },
    { 
      name: 'PascalCase', 
      desc: 'Each word capitalized, no spaces',
      fn: (t: string) => t.replace(/(?:^\w|[A-Z]|\b\w)/g, c => c.toUpperCase()).replace(/\s+/g, ''),
      icon: '🅿️'
    },
    { 
      name: 'CONSTANT_CASE', 
      desc: 'Screaming snake case',
      fn: (t: string) => t.toUpperCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
      icon: '📢'
    },
    { 
      name: 'dot.case', 
      desc: 'Words separated by dots',
      fn: (t: string) => t.toLowerCase().replace(/\s+/g, '.').replace(/[^\w.]/g, ''),
      icon: '⚫'
    },
  ];

  const copy = async (result: string, name: string) => {
    await navigator.clipboard.writeText(result);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  const applyToInput = (fn: (t: string) => string) => {
    setText(fn(text));
  };

  return (
    <ToolLayout
      title="Case Converter"
      description="Transform text between multiple case formats instantly"
      icon={Icons.text}
      gradient="from-cyan-500 to-blue-500"
    >
      {/* Text Input */}
      <div className="relative mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-40 p-6 bg-black/20 border border-white/5 rounded-2xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors text-lg"
        />
        {text && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(text)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setText('')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Clear"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Character Count */}
      {text && (
        <div className="flex gap-4 mb-6 text-sm text-gray-400">
          <span>{text.length} characters</span>
          <span>•</span>
          <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
      )}

      {/* Conversions Grid */}
      {text ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversions.map((conv) => {
            const result = conv.fn(text);
            return (
              <div
                key={conv.name}
                className="bg-black/20 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{conv.icon}</span>
                    <span className="text-sm font-medium text-white">{conv.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => applyToInput(conv.fn)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Apply to input"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => copy(result, conv.name)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copied === conv.name ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-gray-300 truncate font-mono text-sm bg-black/30 rounded-lg px-3 py-2">
                  {result || <span className="text-gray-500 italic">Empty</span>}
                </div>
                <div className="text-xs text-gray-500 mt-2">{conv.desc}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <p>Enter text above to see all case conversions</p>
        </div>
      )}
    </ToolLayout>
  );
}
