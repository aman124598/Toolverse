'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer } from '@/components/StitchComponents';

export default function CaseConverterPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toSentenceCase = () => {
    setText(text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()));
  };

  const toTitleCase = () => {
    setText(text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
  };

  return (
    <ToolLayout 
      title="Case Converter" 
      description="Convert text between UPPERCASE, lowercase, Title Case, and Sentence case"
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
            placeholder="Enter text to convert..."
            className="w-full h-48 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none mb-4"
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onClick={() => setText(text.toUpperCase())} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">UPPERCASE</button>
            <button onClick={() => setText(text.toLowerCase())} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">lowercase</button>
            <button onClick={toTitleCase} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">Title Case</button>
            <button onClick={toSentenceCase} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">Sentence case</button>
          </div>
        </StitchContainer>
      </div>
    </ToolLayout>
  );
}
