'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ original: number; compressed: number; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const compressPdf = async () => {
    if (!file) return;
    
    setCompressing(true);
    setError(null);
    setProgress(10);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setProgress(50);
      
      // Clear metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('Toolverse');
      pdfDoc.setCreator('Toolverse PDF Compressor');
      setProgress(70);
      
      // Save with compression options
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      setProgress(90);
      
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setProgress(100);
      
      setResult({
        original: file.size,
        compressed: compressedBytes.length,
        url
      });
    } catch (err) {
      setError('Failed to compress PDF. The file may be corrupted or password-protected.');
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const reduction = result ? Math.round((1 - result.compressed / result.original) * 100) : 0;

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      icon={Icons.compress}
      gradient="from-rose-500 to-orange-500"
    >
      {/* Upload Area */}
      {!file && (
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
            dragActive 
              ? 'border-purple-500 bg-purple-500/5' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="max-w-sm mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
            <p className="text-gray-400 mb-6">or click to browse files</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl cursor-pointer hover:opacity-90 transition-opacity font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Select PDF File
              <input type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} className="hidden" />
            </label>
            <p className="text-xs text-gray-500 mt-4">Maximum file size: 100MB</p>
          </div>
        </div>
      )}

      {/* File Selected */}
      {file && !result && (
        <div>
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{file.name}</p>
                <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress */}
            {compressing && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Compressing...</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compress Button */}
          {!compressing && (
            <button
              onClick={compressPdf}
              className="mt-6 w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl font-semibold text-lg
                       hover:opacity-90 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Compress PDF
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

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Compression Complete!</h3>
                <p className="text-sm text-gray-400">Your PDF has been optimized</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-xl p-5 text-center border border-white/5">
              <div className="text-sm text-gray-400 mb-1">Original</div>
              <div className="text-xl font-semibold text-white">{formatSize(result.original)}</div>
            </div>
            <div className="bg-black/20 rounded-xl p-5 text-center border border-white/5">
              <div className="text-sm text-gray-400 mb-1">Compressed</div>
              <div className="text-xl font-semibold text-emerald-400">{formatSize(result.compressed)}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-5 text-center border border-emerald-500/20">
              <div className="text-sm text-gray-400 mb-1">Reduced</div>
              <div className="text-xl font-bold text-emerald-400">{reduction}%</div>
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm text-gray-400">Size Comparison</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">Before</span>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">After</span>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${100 - reduction}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <a
            href={result.url}
            download={`compressed_${file?.name}`}
            className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-lg text-center
                     hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
          >
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Compressed PDF
            </span>
          </a>

          {/* Compress Another */}
          <button
            onClick={() => { setFile(null); setResult(null); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            Compress Another PDF
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
