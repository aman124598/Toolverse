'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer } from '@/components/StitchComponents';

export default function WordCounterPage() {
  const [text, setText] = useState('');

  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    paragraphs: text.split(/\n+/).filter(p => p.trim().length > 0).length,
  };

  return (
    <ToolLayout 
      title="Word Counter" 
      description="Calculate words, characters, sentences, and paragraphs in real-time"
      icon={Icons.text}
      gradient="from-blue-500 to-cyan-500"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Words', value: stats.words },
            { label: 'Chars', value: stats.characters },
            { label: 'No Spaces', value: stats.charactersNoSpaces },
            { label: 'Sentences', value: stats.sentences },
            { label: 'Paragraphs', value: stats.paragraphs },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <StitchContainer>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-64 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
          />
        </StitchContainer>
      </div>
    </ToolLayout>
  );
}
