'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Mobile from '@/lib/mobileAdapters';

export default function HtmlToPdfPage() {
  const [html, setHtml] = useState('');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Sample Document</title>
</head>
<body>
  <h1>Welcome to HTML to PDF</h1>
  <p>This is a sample HTML document that will be converted to PDF.</p>
  
  <h2>Features</h2>
  <ul>
    <li>Headings support</li>
    <li><strong>Bold</strong> and <em>italic</em> text</li>
    <li>Lists (ordered and unordered)</li>
    <li>Paragraphs</li>
  </ul>
  
  <h3>Example Code</h3>
  <p>You can include any HTML content here.</p>
  
  <p><strong>Thank you for using Toolverse!</strong></p>
</body>
</html>`;

  const convertToPdf = async () => {
    if (!html.trim()) {
      setError('Please enter some HTML');
      return;
    }

    setConverting(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('html', html);

      setProgress(40);

      const response = await fetch('/api/html-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert HTML');
      }

      const blob = await response.blob();

      setProgress(90);

      await Mobile.saveFile(blob, 'html_to_pdf.pdf');

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to convert HTML');
    } finally {
      setConverting(false);
    }
  };

  return (
    <ToolLayout
      title="HTML to PDF"
      description="Convert HTML content to PDF document"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      }
      gradient="from-orange-500 to-red-500"
    >
      <div className="space-y-6">
        {/* HTML Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Enter your HTML</label>
            <button
              onClick={() => setHtml(sampleHtml)}
              className="text-xs text-orange-400 hover:text-orange-300"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={html}
            onChange={(e) => { setHtml(e.target.value); setResult(false); }}
            placeholder="<h1>Your HTML here</h1>&#10;<p>Start typing or paste HTML...</p>"
            className="w-full h-[350px] px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none font-mono text-sm"
          />
        </div>

        {/* Supported Tags */}
        {!result && !converting && (
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Supported HTML Tags</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['h1', 'h2', 'h3', 'p', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded">
                  &lt;{tag}&gt;
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {converting && (
          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
              <div>
                <p className="font-medium text-white">Creating PDF...</p>
                <p className="text-sm text-gray-400">{progress}% complete</p>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
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
                  <p className="text-sm text-gray-400">Your HTML has been converted</p>
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
            disabled={!html.trim()}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-semibold text-lg
                     hover:opacity-90 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3
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
