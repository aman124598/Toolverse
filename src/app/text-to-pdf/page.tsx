'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Mobile from '@/lib/mobileAdapters';

export default function TextToPdfPage() {
  const [text, setText] = useState('');
  const [converting, setConverting] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const convertToPdf = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setConverting(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('fontSize', fontSize.toString());
      formData.append('fontFamily', fontFamily);
      formData.append('lineSpacing', lineSpacing.toString());

      setProgress(40);

      const response = await fetch('/api/text-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert text');
      }

      const blob = await response.blob();

      setProgress(90);

      await Mobile.saveFile(blob, 'text_to_pdf.pdf');

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to convert text');
    } finally {
      setConverting(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout
      title="Text to PDF"
      description="Convert plain text to PDF document"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      gradient="from-violet-500 to-purple-500"
    >
      <div className="space-y-6">
        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Enter your text</label>
            <span className="text-xs text-gray-500">{wordCount} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setResult(false); }}
            placeholder="Type or paste your text here..."
            className="w-full h-[300px] px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
          />
        </div>

        {/* Options */}
        {!result && !converting && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <label className="text-sm text-gray-400 mb-2 block">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                {[10, 11, 12, 14, 16, 18, 20, 24].map(size => (
                  <option key={size} value={size}>{size}pt</option>
                ))}
              </select>
            </div>

            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <label className="text-sm text-gray-400 mb-2 block">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="Helvetica">Helvetica</option>
                <option value="TimesRoman">Times Roman</option>
                <option value="Courier">Courier</option>
              </select>
            </div>

            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <label className="text-sm text-gray-400 mb-2 block">Line Spacing</label>
              <select
                value={lineSpacing}
                onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="1">Single</option>
                <option value="1.5">1.5</option>
                <option value="2">Double</option>
              </select>
            </div>
          </div>
        )}

        {/* Progress */}
        {converting && (
          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
              <div>
                <p className="font-medium text-white">Creating PDF...</p>
                <p className="text-sm text-gray-400">{progress}% complete</p>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
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
                  <p className="text-sm text-gray-400">{wordCount} words converted</p>
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
            disabled={!text.trim()}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl font-semibold text-lg
                     hover:opacity-90 transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-3
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
