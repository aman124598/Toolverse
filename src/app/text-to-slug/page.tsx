'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchButton } from '@/components/StitchComponents';

export default function TextToSlugPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setOutput(slug);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolLayout 
      title="Text to Slug" 
      description="Convert any text into a clean, URL-friendly slug"
      icon={Icons.text}
      gradient="from-blue-500 to-cyan-500"
    >
      <div className="space-y-6">
        <StitchContainer>
          <label className="block text-sm text-gray-400 mb-3">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to convert to slug... e.g. 'Hello World! Awesome'"
            className="w-full h-32 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
          />
        </StitchContainer>
        
        <div className="flex justify-center">
          <StitchButton onClick={handleConvert} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}>
            Generate Slug
          </StitchButton>
        </div>

        {output && (
          <StitchContainer>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm text-gray-400">Result</label>
              <button onClick={copyToClipboard} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white overflow-x-auto whitespace-pre-wrap word-break">
              {output}
            </div>
          </StitchContainer>
        )}
      </div>
    </ToolLayout>
  );
}
