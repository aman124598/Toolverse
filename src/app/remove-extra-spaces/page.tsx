'use client';

import { useState } from 'react';

export default function RemoveExtraSpacesPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const cleanups = [
    {
      name: 'Remove Extra Spaces',
      icon: '✂️',
      transform: (t: string) => t.replace(/  +/g, ' ').trim(),
    },
    {
      name: 'Remove All Spaces',
      icon: '🚫',
      transform: (t: string) => t.replace(/\s+/g, ''),
    },
    {
      name: 'Remove Leading/Trailing',
      icon: '⬜',
      transform: (t: string) => t.split('\n').map(line => line.trim()).join('\n'),
    },
    {
      name: 'Single Line',
      icon: '➡️',
      transform: (t: string) => t.replace(/\s+/g, ' ').trim(),
    },
    {
      name: 'Remove Empty Lines',
      icon: '📄',
      transform: (t: string) => t.split('\n').filter(line => line.trim()).join('\n'),
    },
    {
      name: 'Normalize Whitespace',
      icon: '🔧',
      transform: (t: string) => t.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim(),
    },
  ];

  const [selectedCleanup, setSelectedCleanup] = useState(cleanups[0]);
  const result = selectedCleanup.transform(input);

  const stats = {
    originalLength: input.length,
    resultLength: result.length,
    spacesRemoved: input.length - result.length,
    originalWords: input.split(/\s+/).filter(w => w).length,
    originalLines: input.split('\n').length,
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-7xl mb-6 inline-block">✂️</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Remove Extra Spaces
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Clean up messy text by removing unwanted spaces and whitespace
          </p>
        </div>

        {/* Cleanup Options */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {cleanups.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCleanup(c)}
              className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                selectedCleanup.name === c.name
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-sky-500'
              }`}
            >
              <span>{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">📥 Input</h3>
              <button
                onClick={() => setInput('')}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste   your    messy   text   here..."
              className="w-full h-64 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none
                       focus:outline-none focus:ring-4 focus:ring-sky-500/30 focus:border-sky-500
                       dark:bg-gray-700 dark:text-white font-mono"
            />
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">📤 Cleaned Output</h3>
              <button
                onClick={copy}
                disabled={!result}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all text-sm disabled:opacity-50"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div className="w-full h-64 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                          bg-gray-50 dark:bg-gray-900 overflow-auto font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {result || <span className="text-gray-400">Cleaned text will appear here...</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        {input && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Original Length', value: stats.originalLength },
              { label: 'Cleaned Length', value: stats.resultLength },
              { label: 'Chars Removed', value: stats.spacesRemoved, highlight: true },
              { label: 'Words', value: stats.originalWords },
              { label: 'Lines', value: stats.originalLines },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 text-center ${
                s.highlight 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
                <div className={`text-2xl font-bold ${s.highlight ? '' : 'text-sky-600 dark:text-sky-400'}`}>
                  {s.value}
                </div>
                <div className={`text-xs ${s.highlight ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
