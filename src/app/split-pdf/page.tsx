'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const [splitMode, setSplitMode] = useState<'range' | 'extract' | 'every'>('range');
  const [rangeInput, setRangeInput] = useState('');
  const [everyN, setEveryN] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const loadPdf = async (pdfFile: File) => {
    try {
      // Get page count using pdf-lib on client side for quick preview
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
      setFile(pdfFile);
      setError(null);
      setResult(false);
    } catch {
      setError('Failed to load PDF');
    }
  };

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      await loadPdf(droppedFile);
    } else {
      setError('Please drop a PDF file');
    }
  }, []);

  const splitPdf = async () => {
    if (!file) return;

    let ranges = '';
    if (splitMode === 'range' || splitMode === 'extract') {
      ranges = rangeInput;
    } else if (splitMode === 'every') {
      // Generate ranges for splitting every N pages
      const rangeArray = [];
      for (let i = 1; i <= pageCount; i += everyN) {
        const end = Math.min(i + everyN - 1, pageCount);
        rangeArray.push(`${i}-${end}`);
      }
      ranges = rangeArray[0]; // For now, download just the first chunk
    }

    if (!ranges) {
      setError('Please specify which pages to extract');
      return;
    }

    setSplitting(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ranges', ranges);

      setProgress(40);

      const response = await fetch('/api/pdf-split', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to split PDF');
      }

      const blob = await response.blob();
      
      setProgress(90);

      // Download the split PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
    } finally {
      setSplitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout 
      title="Split PDF" 
      description="Extract pages and split your PDFs into precise segments"
      icon={Icons.split}
      gradient="from-purple-500 to-pink-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to extract or split pages"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{pageCount} Pages</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setResult(false); setPageCount(0); }} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={splitting}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </StitchContainer>

          {/* Split Options */}
          {!result && !splitting && (
            <div className="space-y-4">
              <StitchContainer>
                <h4 className="font-medium text-white mb-4">Split Mode</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'range', label: 'By Range', desc: 'e.g., 1-5, 8, 10' },
                    { key: 'extract', label: 'Extract Pages', desc: 'Specific pages' },
                    { key: 'every', label: 'Every N Pages', desc: 'Split evenly' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSplitMode(opt.key as 'range' | 'extract' | 'every')}
                      className={`relative p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden ${
                        splitMode === opt.key
                          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {splitMode === opt.key && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                      )}
                      <div className="relative z-10 w-full flex flex-col justify-center">
                        <p className={`font-medium ${splitMode === opt.key ? 'text-white' : ''}`}>{opt.label}</p>
                        <p className="text-xs mt-1 opacity-70">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </StitchContainer>

              {/* Input based on mode */}
              <StitchContainer>
                {(splitMode === 'range' || splitMode === 'extract') && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">
                      {splitMode === 'range' ? 'Page Ranges' : 'Pages to Extract'} (1-{pageCount})
                    </label>
                    <input
                      type="text"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      placeholder="e.g., 1-5, 8, 10-12"
                      className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    
                    {/* Quick Select */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button 
                        onClick={() => setRangeInput('1')}
                        className="px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                      >
                        First page
                      </button>
                      <button 
                        onClick={() => setRangeInput(pageCount.toString())}
                        className="px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                      >
                        Last page
                      </button>
                      <button 
                        onClick={() => setRangeInput(`1-${Math.ceil(pageCount/2)}`)}
                        className="px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                      >
                        First half
                      </button>
                      <button 
                        onClick={() => setRangeInput(`${Math.ceil(pageCount/2)+1}-${pageCount}`)}
                        className="px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                      >
                        Second half
                      </button>
                    </div>
                  </div>
                )}

                {splitMode === 'every' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Split every N pages</label>
                    <select
                      value={everyN}
                      onChange={(e) => setEveryN(parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                    >
                      {[1, 2, 3, 5, 10].map((n) => (
                        <option key={n} value={n} className="bg-gray-900 text-white">Every {n} page{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
              </StitchContainer>
            </div>
          )}

          {/* Progress */}
          {splitting && (
            <StitchContainer>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">Splitting PDF...</p>
                  <p className="text-sm text-gray-400">{progress}% complete</p>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </StitchContainer>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <StitchContainer className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-400">PDF Split Successfully!</h3>
                    <p className="text-sm text-gray-400">Your extracted pages have been downloaded</p>
                  </div>
                </div>
              </StitchContainer>

              <button
                onClick={() => { setFile(null); setResult(false); setPageCount(0); setRangeInput(''); }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-all"
              >
                Split Another PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 font-medium">{error}</span>
        </div>
      )}

      {/* Split Button */}
      {file && !result && !splitting && (
        <div className="mt-6">
          <StitchButton 
            onClick={splitPdf}
            icon={Icons.split}
          >
            Split PDF
          </StitchButton>
        </div>
      )}
    </ToolLayout>
  );
}
