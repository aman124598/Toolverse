'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ keys: number; depth: number; size: string } | null>(null);

  const analyzeJson = (obj: unknown, depth = 0): { keys: number; maxDepth: number } => {
    if (typeof obj !== 'object' || obj === null) return { keys: 0, maxDepth: depth };
    
    let keys = 0;
    let maxDepth = depth;
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = analyzeJson(item, depth + 1);
        keys += result.keys;
        maxDepth = Math.max(maxDepth, result.maxDepth);
      }
    } else {
      keys = Object.keys(obj).length;
      for (const value of Object.values(obj)) {
        const result = analyzeJson(value, depth + 1);
        keys += result.keys;
        maxDepth = Math.max(maxDepth, result.maxDepth);
      }
    }
    
    return { keys, maxDepth };
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError(null);
      
      const analysis = analyzeJson(parsed);
      setStats({
        keys: analysis.keys,
        depth: analysis.maxDepth,
        size: formatBytes(new Blob([formatted]).size)
      });
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      setOutput('');
      setStats(null);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      
      const analysis = analyzeJson(parsed);
      setStats({
        keys: analysis.keys,
        depth: analysis.maxDepth,
        size: formatBytes(new Blob([minified]).size)
      });
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      setOutput('');
      setStats(null);
    }
  };

  const validateJson = () => {
    try {
      const parsed = JSON.parse(input);
      setError(null);
      setOutput('✓ Valid JSON');
      
      const analysis = analyzeJson(parsed);
      setStats({
        keys: analysis.keys,
        depth: analysis.maxDepth,
        size: formatBytes(new Blob([input]).size)
      });
    } catch (e) {
      setError(`${(e as Error).message}`);
      setOutput('');
      setStats(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const loadSample = () => {
    const sample = {
      name: "Toolverse",
      version: "2.0.0",
      description: "Free online tools for everyone",
      tools: [
        { id: 1, name: "JSON Formatter", category: "Code" },
        { id: 2, name: "Password Generator", category: "Security" }
      ],
      config: {
        free: true,
        signup: false,
        limit: null
      }
    };
    setInput(JSON.stringify(sample));
    setOutput('');
    setError(null);
    setStats(null);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate, and beautify JSON with syntax highlighting"
      icon={Icons.code}
      gradient="from-amber-500 to-orange-500"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={formatJson}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Format
          </button>
          <button
            onClick={minifyJson}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Minify
          </button>
          <button
            onClick={validateJson}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validate
          </button>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-gray-400">Indent:</span>
          <div className="flex bg-white/5 rounded-lg p-1">
            {[2, 4].map((size) => (
              <button
                key={size}
                onClick={() => setIndent(size)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  indent === size ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          >
            Load Sample
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Input
            </span>
            <button 
              onClick={() => { setInput(''); setOutput(''); setError(null); setStats(null); }} 
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full h-96 p-4 bg-black/20 border border-white/5 rounded-2xl text-white font-mono text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Output
            </span>
            {output && !error && (
              <button 
                onClick={copy} 
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div className={`w-full h-96 p-4 bg-black/20 border rounded-2xl font-mono text-sm overflow-auto whitespace-pre-wrap ${
            error ? 'border-red-500/30' : 'border-white/5'
          }`}>
            {error ? (
              <div className="flex items-start gap-3 text-red-400">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : output ? (
              <span className="text-emerald-400">{output}</span>
            ) : (
              <span className="text-gray-600">Formatted output will appear here...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center justify-center gap-8 mt-6 py-4 bg-black/20 rounded-xl border border-white/5">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{stats.keys}</div>
            <div className="text-xs text-gray-500">Total Keys</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{stats.depth}</div>
            <div className="text-xs text-gray-500">Max Depth</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{stats.size}</div>
            <div className="text-xs text-gray-500">File Size</div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
