'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function MarkdownToPdfPage() {
  const [markdown, setMarkdown] = useState('');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const sampleMarkdown = `# Welcome to Markdown to PDF

## Introduction
This is a sample markdown document that will be converted to PDF.

### Features
- Headings (H1, H2, H3)
- **Bold text** and *italic text*
- Bullet lists
- Numbered lists

### Code Example
\`\`\`
function hello() {
  console.log("Hello World!");
}
\`\`\`

## Conclusion
Thank you for using Toolverse!`;

  const convertToPdf = async () => {
    if (!markdown.trim()) {
      setError('Please enter some markdown');
      return;
    }

    setConverting(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('markdown', markdown);

      setProgress(40);

      const response = await fetch('/api/markdown-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert markdown');
      }

      const blob = await response.blob();
      
      setProgress(90);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'markdown_to_pdf.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to convert markdown');
    } finally {
      setConverting(false);
    }
  };

  return (
    <ToolLayout 
      title="Markdown to PDF" 
      description="Convert Markdown text to PDF document"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      }
      gradient="from-slate-500 to-gray-500"
    >
      <div className="space-y-6">
        {/* Markdown Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Enter your Markdown</label>
            <button
              onClick={() => setMarkdown(sampleMarkdown)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => { setMarkdown(e.target.value); setResult(false); }}
            placeholder="# Heading&#10;&#10;Write your **markdown** here..."
            className="w-full h-[350px] px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-slate-500/50 resize-none font-mono text-sm"
          />
        </div>

        {/* Syntax Guide */}
        {!result && !converting && (
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Supported Syntax</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400"># Heading 1</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">## Heading 2</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">**bold**</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">*italic*</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">- list item</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">1. numbered</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">`code`</code>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-blue-400">```block```</code>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {converting && (
          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              <div>
                <p className="font-medium text-white">Creating PDF...</p>
                <p className="text-sm text-gray-400">{progress}% complete</p>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-slate-500 to-gray-500 transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-400">PDF Created Successfully!</h3>
                  <p className="text-sm text-gray-400">Your markdown has been converted</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setResult(false)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              Edit and Convert Again
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Convert Button */}
        {!result && !converting && (
          <button
            onClick={convertToPdf}
            disabled={!markdown.trim()}
            className="w-full py-4 bg-gradient-to-r from-slate-500 to-gray-500 rounded-2xl font-semibold text-lg
                     hover:opacity-90 transition-all shadow-lg shadow-slate-500/20 flex items-center justify-center gap-3
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Convert to PDF
          </button>
        )}
      </div>
    </ToolLayout>
  );
}
