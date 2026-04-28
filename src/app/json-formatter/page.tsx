'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchButton } from '@/components/StitchComponents';
import Mobile from '@/lib/mobileAdapters';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [space, setSpace] = useState(2);

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, space));
      setError(null);
      setCopied(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await Mobile.copyText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format, prettify, and validate JSON data instantly"
      icon={Icons.code}
      gradient="from-indigo-500 to-violet-500"
    >
      <div className="space-y-6">
        <StitchContainer>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-gray-400">Input JSON</label>
            <select
              value={space}
              onChange={(e) => setSpace(Number(e.target.value))}
              className="bg-black/40 border border-white/10 rounded-lg text-sm text-gray-300 px-2 py-1 outline-none focus:border-indigo-500"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-48 sm:h-64 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
          />
        </StitchContainer>

        <div className="flex justify-center gap-4">
          <StitchButton onClick={formatJson} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>}>
            Format & Validate
          </StitchButton>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium text-sm flex gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {output && !error && (
          <StitchContainer className="bg-black/80">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <label className="block text-sm text-indigo-400 font-medium">Valid JSON Result</label>
              <button
                onClick={copyToClipboard}
                className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
              >
                {copied ? 'Copied!' : 'Copy formatted'}
              </button>
            </div>
            <pre className="w-full overflow-x-auto text-sm text-white font-mono custom-scrollbar">
              {output}
            </pre>
          </StitchContainer>
        )}
      </div>
    </ToolLayout>
  );
}
