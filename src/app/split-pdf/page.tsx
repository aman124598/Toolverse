'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<'range' | 'pages' | 'every'>('range');
  const [rangeStart, setRangeStart] = useState('1');
  const [rangeEnd, setRangeEnd] = useState('');
  const [everyN, setEveryN] = useState('1');
  const [splitting, setSplitting] = useState(false);
  const [result, setResult] = useState<{ url: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      await loadPdf(droppedFile);
    } else {
      setError('Please drop a PDF file');
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await loadPdf(selectedFile);
    }
  };

  const loadPdf = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setFile(pdfFile);
      setResult(null);
      setError(null);
      setRangeStart('1');
      setRangeEnd(String(count));
    } catch {
      setError('Failed to load PDF. The file may be corrupted.');
    }
  };

  const splitPdf = async () => {
    if (!file) return;
    
    setSplitting(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      let pageIndices: number[] = [];
      
      if (splitMode === 'range') {
        const start = Math.max(1, parseInt(rangeStart) || 1);
        const end = Math.min(pageCount, parseInt(rangeEnd) || pageCount);
        pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
      } else if (splitMode === 'every') {
        const n = parseInt(everyN) || 1;
        pageIndices = Array.from({ length: pageCount }, (_, i) => i).filter(i => (i + 1) % n === 0);
      }
      
      if (pageIndices.length === 0) {
        setError('No pages selected. Please adjust your selection.');
        setSplitting(false);
        return;
      }
      
      const pages = await newPdf.copyPages(sourcePdf, pageIndices);
      pages.forEach(page => newPdf.addPage(page));
      
      newPdf.setProducer('Toolverse PDF Splitter');
      newPdf.setCreator('Toolverse');
      
      const splitBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(splitBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setResult({ url, pages: pageIndices.length });
    } catch (err) {
      setError('Failed to split PDF');
      console.error(err);
    } finally {
      setSplitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages from your PDF document"
      icon={Icons.split}
      gradient="from-teal-500 to-emerald-500"
    >
      {/* Upload Area */}
      {!file ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
            dragActive ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl cursor-pointer hover:opacity-90 transition-opacity font-medium">
            Select PDF File
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-gray-400">{pageCount} pages • {formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); setPageCount(0); }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Split Mode Selection */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Split Mode</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSplitMode('range')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  splitMode === 'range' 
                    ? 'border-teal-500/50 bg-teal-500/10' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-lg mb-1">📄 Extract Range</div>
                <div className="text-xs text-gray-500">Get pages from X to Y</div>
              </button>
              <button
                onClick={() => setSplitMode('every')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  splitMode === 'every' 
                    ? 'border-teal-500/50 bg-teal-500/10' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-lg mb-1">🔢 Every Nth Page</div>
                <div className="text-xs text-gray-500">Extract every 2nd, 3rd page...</div>
              </button>
            </div>

            {splitMode === 'range' && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">From Page</label>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div className="text-gray-600 mt-5">→</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">To Page</label>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>
            )}

            {splitMode === 'every' && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Extract every</span>
                <input
                  type="number"
                  min="1"
                  max={pageCount}
                  value={everyN}
                  onChange={(e) => setEveryN(e.target.value)}
                  className="w-20 px-4 py-2 bg-black/30 border border-white/5 rounded-xl text-white text-center focus:outline-none focus:border-teal-500/50"
                />
                <span className="text-gray-400">page(s)</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { setRangeStart('1'); setRangeEnd('1'); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400"
            >
              First page
            </button>
            <button
              onClick={() => { setRangeStart(String(pageCount)); setRangeEnd(String(pageCount)); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400"
            >
              Last page
            </button>
            <button
              onClick={() => { setRangeStart('1'); setRangeEnd(String(Math.ceil(pageCount / 2))); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400"
            >
              First half
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Split Button */}
      {file && !result && (
        <button
          onClick={splitPdf}
          disabled={splitting}
          className="mt-6 w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl font-semibold text-lg
                   hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3"
        >
          {splitting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Splitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Split PDF
            </>
          )}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">PDF Split Successfully!</h3>
                <p className="text-sm text-gray-400">{result.pages} pages extracted</p>
              </div>
            </div>
          </div>
          
          <a
            href={result.url}
            download={`split_${rangeStart}-${rangeEnd}.pdf`}
            className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-lg text-center
                     hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
          >
            Download Split PDF
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
