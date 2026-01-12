'use client';

import { useState } from 'react';

export default function ReverseTextPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const transformations = [
    {
      name: 'Reverse Text',
      icon: '🔄',
      transform: (t: string) => t.split('').reverse().join(''),
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Reverse Words',
      icon: '📝',
      transform: (t: string) => t.split(' ').reverse().join(' '),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Reverse Each Word',
      icon: '🔤',
      transform: (t: string) => t.split(' ').map(w => w.split('').reverse().join('')).join(' '),
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Flip Upside Down',
      icon: '🙃',
      transform: (t: string) => {
        const flipMap: Record<string, string> = {
          'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
          'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
          'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
          'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': 'q', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ',
          'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
          'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ',
          'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ',
          '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': '\'',
          '\'': ',', '"': ',,', '!': '¡', '?': '¿', '[': ']', ']': '[', '(': ')', ')': '(',
          '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾',
        };
        return t.split('').map(c => flipMap[c] || c).reverse().join('');
      },
      color: 'from-orange-500 to-amber-500'
    },
    {
      name: 'Mirror Text',
      icon: '🪞',
      transform: (t: string) => {
        const mirrorMap: Record<string, string> = {
          'a': 'ɒ', 'b': 'd', 'c': 'ɔ', 'd': 'b', 'e': 'ɘ', 'f': 'Ꮈ', 'g': 'ǫ', 'h': 'ʜ',
          'i': 'i', 'j': 'ꞁ', 'k': 'ʞ', 'l': 'l', 'm': 'm', 'n': 'ᴎ', 'o': 'o', 'p': 'q',
          'q': 'p', 'r': 'ɿ', 's': 'ꙅ', 't': 'ƚ', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
          'y': 'ʏ', 'z': 'ꙅ', 'A': 'A', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ꟻ',
          'G': 'Ꭾ', 'H': 'H', 'I': 'I', 'J': 'Ⴑ', 'K': 'ꓘ', 'L': '⅃', 'M': 'M', 'N': 'И',
          'O': 'O', 'P': 'ꟼ', 'Q': 'Ǫ', 'R': 'Я', 'S': 'Ꙅ', 'T': 'T', 'U': 'U', 'V': 'V',
          'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Ꙅ', '1': '1', '2': 'ᘔ', '3': 'Ɛ', '4': 'ᔭ',
          '5': '5', '6': 'მ', '7': '⎈', '8': '8', '9': 'ᑫ', '0': '0',
        };
        return t.split('').map(c => mirrorMap[c] || c).reverse().join('');
      },
      color: 'from-rose-500 to-red-500'
    },
  ];

  const copy = async (text: string, name: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-7xl mb-6 inline-block">🔄</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Reverse Text
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Reverse, flip, and mirror your text in fun ways
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
            placeholder="Type something fun to reverse!"
            className="w-full h-32 p-5 border-2 border-gray-200 dark:border-gray-600 rounded-2xl resize-none
                     focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500
                     dark:bg-gray-700 dark:text-white text-lg"
          />
        </div>

        {/* Transformations */}
        {input && (
          <div className="space-y-4">
            {transformations.map((t) => {
              const result = t.transform(input);
              return (
                <div key={t.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <span className={`font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>
                        {t.name}
                      </span>
                    </div>
                    <button
                      onClick={() => copy(result, t.name)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                    >
                      {copied === t.name ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl font-mono text-gray-800 dark:text-gray-200 break-all">
                    {result}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
