'use client';

import { useState } from 'react';

export default function TextToSlugPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
  };

  const slug = generateSlug(input);

  const variations = [
    { label: 'kebab-case', value: slug },
    { label: 'snake_case', value: slug.replace(/-/g, '_') },
    { label: 'camelCase', value: slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) },
    { label: 'PascalCase', value: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') },
    { label: 'SCREAMING_SNAKE', value: slug.toUpperCase().replace(/-/g, '_') },
    { label: 'dot.case', value: slug.replace(/-/g, '.') },
  ];

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-7xl mb-6 inline-block">🔗</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Text to Slug
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Convert any text to URL-friendly slugs in multiple formats
          </p>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Enter your text:
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="My Awesome Blog Post Title!"
            className="w-full h-32 p-5 border-2 border-gray-200 dark:border-gray-600 rounded-2xl resize-none
                     focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500
                     dark:bg-gray-700 dark:text-white text-lg"
          />

          {/* Main Slug */}
          {input && (
            <div className="mt-6 p-6 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">URL Slug:</div>
                  <div className="text-2xl font-mono font-bold text-cyan-700 dark:text-cyan-300">{slug}</div>
                </div>
                <button
                  onClick={() => copy(slug)}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Variations */}
        {input && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">🎨 All Formats</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {variations.map((v) => (
                <div key={v.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{v.label}</div>
                    <div className="font-mono text-gray-800 dark:text-gray-200">{v.value || '-'}</div>
                  </div>
                  <button
                    onClick={() => copy(v.value)}
                    className="px-3 py-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-6">
          <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">💡 What is a slug?</h3>
          <p className="text-cyan-800 dark:text-cyan-200 text-sm">
            A slug is a URL-friendly version of text, typically used in web addresses. 
            It removes special characters, converts spaces to hyphens, and makes everything lowercase.
            For example: &ldquo;My Blog Post!&rdquo; becomes &ldquo;my-blog-post&rdquo;.
          </p>
        </div>
      </div>
    </div>
  );
}
