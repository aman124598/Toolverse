'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Mobile from '@/lib/mobileAdapters';

export default function PdfToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setExtractedText('');
      setError(null);
    } else {
      setError('Please drop a PDF file');
    }
  }, []);

  const extractText = async () => {
    if (!file) return;
    setExtracting(true);
    setProgress(10);
    setError(null);

    try {
      // Upload PDF to server for text extraction
      const formData = new FormData();
      formData.append('file', file);

      setProgress(40);

      const response = await fetch('/api/pdf-extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract text from PDF');
      }

      const data = await response.json();

      setProgress(90);
      setExtractedText(data.text || 'No text found in this PDF.');
      setPageCount(data.numPages || 0);
      setProgress(100);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to extract text. Please try another file.');
    } finally {
      setExtracting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Mobile.copyText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadAsText = async () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    await Mobile.saveFile(blob, file?.name.replace('.pdf', '.txt') || 'extracted_text.txt');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  return (
    <ToolLayout
      title="PDF to Text"
      description="Extract all text content from PDF documents"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      gradient="from-emerald-500 to-teal-500"
    >
      {!file ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'
            }`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
            Select PDF
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setExtractedText('');
                  setError(null);
                }
              }}
              className="hidden"
            />
          </label>

          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Server-side Text Extraction
            </div>
            <p className="text-xs text-gray-400">Accurately extracts all text from your PDF</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setExtractedText(''); }}
              className="p-2 hover:bg-white/5 rounded-lg"
              disabled={extracting}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          {extracting && (
            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <div>
                  <p className="font-medium text-white">Extracting text...</p>
                  <p className="text-sm text-gray-400">{progress}% complete</p>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Text */}
          {extractedText && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">{pageCount} pages</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{wordCount.toLocaleString()} words</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{charCount.toLocaleString()} characters</span>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-[400px] px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none"
                  placeholder="Extracted text will appear here..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Text
                    </>
                  )}
                </button>

                <button
                  onClick={downloadAsText}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium 
                           flex items-center justify-center gap-2 hover:opacity-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .txt
                </button>
              </div>

              <button
                onClick={() => { setFile(null); setExtractedText(''); }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                Extract from Another PDF
              </button>
            </div>
          )}

          {/* Extract Button */}
          {!extractedText && !extracting && (
            <button
              onClick={extractText}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-lg
                       hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Extract Text
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400">{error}</span>
        </div>
      )}
    </ToolLayout>
  );
}
