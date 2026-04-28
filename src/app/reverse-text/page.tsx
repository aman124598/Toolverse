'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer } from '@/components/StitchComponents';
import Mobile from '@/lib/mobileAdapters';

export default function ReverseTextPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (text) {
      void Mobile.copyText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reverseCharacters = () => {
    setText(text.split('').reverse().join(''));
  };

  const reverseWords = () => {
    setText(text.split(' ').reverse().join(' '));
  };

  const reverseLines = () => {
    setText(text.split('\n').reverse().join('\n'));
  };

  return (
    <ToolLayout
      title="Reverse Text"
      description="Reverse text backwards, reverse words, or reverse lines"
      icon={Icons.text}
      gradient="from-blue-500 to-cyan-500"
    >
      <div className="space-y-6">
        <StitchContainer>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-gray-400">Your Text</label>
            <button onClick={copyToClipboard} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to reverse..."
            className="w-full h-48 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none mb-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={reverseCharacters} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">Reverse Characters</button>
            <button onClick={reverseWords} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">Reverse Words</button>
            <button onClick={reverseLines} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">Reverse Lines</button>
          </div>
        </StitchContainer>
      </div>
    </ToolLayout>
  );
}
