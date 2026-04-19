'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer } from '@/components/StitchComponents';

export default function RemoveExtraSpacesPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const removeExtraSpaces = () => {
    setText(text.replace(/\s+/g, ' ').trim());
  };

  return (
    <ToolLayout 
      title="Remove Extra Spaces" 
      description="Clean up text by removing extra spaces, tabs, and unnecessary blank lines"
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
            placeholder="Enter text with extra   spaces   ..."
            className="w-full h-48 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none mb-4"
          />
          
          <div className="flex justify-center">
            <button onClick={removeExtraSpaces} className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl text-sm font-medium text-blue-300 transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              Remove Extra Spaces
            </button>
          </div>
        </StitchContainer>
      </div>
    </ToolLayout>
  );
}
