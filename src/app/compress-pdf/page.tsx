'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';
import Mobile from '@/lib/mobileAdapters';

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number; savings: number } | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please drop a PDF file');
    }
  }, []);

  const compressPdf = async () => {
    if (!file) return;

    setCompressing(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', quality);

      setProgress(30);

      const response = await fetch('/api/pdf-compress', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compress PDF');
      }

      const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
      const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
      const savings = parseInt(response.headers.get('X-Savings-Percent') || '0');

      const blob = await response.blob();

      setProgress(90);

      // Download the compressed PDF
      await Mobile.saveFile(blob, `compressed_${file.name}`);

      setProgress(100);
      setResult({ originalSize, compressedSize, savings });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to compress PDF');
    } finally {
      setCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining extreme quality"
      icon={Icons.compress}
      gradient="from-purple-500 to-pink-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
              setResult(null);
              setError(null);
            }
          }}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="or click to browse"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <StitchContainer noPadding>
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                {Icons.document}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={compressing}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </StitchContainer>

          {/* Quality Options */}
          {!result && !compressing && (
            <StitchContainer>
              <h4 className="font-medium text-white mb-4">Compression Level</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'low', label: 'Maximum', desc: 'Smallest file' },
                  { key: 'medium', label: 'Balanced', desc: 'Recommended' },
                  { key: 'high', label: 'Quality', desc: 'Best quality' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setQuality(opt.key as 'low' | 'medium' | 'high')}
                    className={`relative p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${quality === opt.key
                        ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                  >
                    {quality === opt.key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                    )}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <p className={`font-medium ${quality === opt.key ? 'text-white' : ''}`}>{opt.label}</p>
                      <p className="text-xs mt-1 opacity-70">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </StitchContainer>
          )}

          {/* Progress */}
          {compressing && (
            <StitchContainer>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">Compressing PDF...</p>
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
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-400">Compression Complete!</h3>
                    <p className="text-sm text-gray-400">Your PDF is now highly optimized</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Original</p>
                    <p className="font-semibold text-white">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5" />
                    <p className="relative text-xs text-emerald-400/80 mb-1">Compressed</p>
                    <p className="relative font-semibold text-emerald-400">{formatSize(result.compressedSize)}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-purple-500/5" />
                    <p className="relative text-xs text-purple-400/80 mb-1">Saved</p>
                    <p className="relative font-semibold text-purple-400">{result.savings}%</p>
                  </div>
                </div>
              </StitchContainer>

              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-all"
              >
                Compress Another PDF
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

      {/* Compress Button */}
      {file && !result && !compressing && (
        <div className="mt-6">
          <StitchButton
            onClick={compressPdf}
            icon={Icons.compress}
          >
            Compress PDF
          </StitchButton>
        </div>
      )}
    </ToolLayout>
  );
}
