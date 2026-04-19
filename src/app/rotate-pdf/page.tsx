'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotating, setRotating] = useState(false);
  const [rotation, setRotation] = useState(90);
  const [applyTo, setApplyTo] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const loadPdf = async (pdfFile: File) => {
    try {
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

  const rotatePdf = async () => {
    if (!file) return;

    setRotating(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('rotation', rotation.toString());
      formData.append('pages', applyTo === 'all' ? 'all' : customPages);

      setProgress(40);

      const response = await fetch('/api/pdf-rotate', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rotate PDF');
      }

      const blob = await response.blob();
      
      setProgress(90);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rotated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to rotate PDF');
    } finally {
      setRotating(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout 
      title="Rotate PDF" 
      description="Quickly rotate all or specific pages of your PDF document"
      icon={Icons.rotate}
      gradient="from-cyan-500 to-blue-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to configure rotation"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{pageCount} Pages</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setResult(false); setPageCount(0); }} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={rotating}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </StitchContainer>

          {/* Rotation Options */}
          {!result && !rotating && (
            <div className="space-y-4">
              {/* Rotation Angle */}
              <StitchContainer>
                <h4 className="font-medium text-white mb-4">Rotation Angle</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { deg: 90, label: '90° Right' },
                    { deg: -90, label: '90° Left' },
                    { deg: 180, label: '180°' },
                    { deg: 270, label: '270°' },
                  ].map((opt) => (
                    <button
                      key={opt.deg}
                      onClick={() => setRotation(opt.deg)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 overflow-hidden ${
                        rotation === opt.deg
                          ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {rotation === opt.deg && (
                         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
                      )}
                      <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="w-10 h-10 mb-2 flex items-center justify-center rounded-full bg-white/5">
                          <svg 
                            className={`w-6 h-6 transition-transform duration-500 ${rotation === opt.deg ? 'text-white' : ''}`}
                            style={{ transform: `rotate(${opt.deg}deg)` }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className={`text-sm font-medium ${rotation === opt.deg ? 'text-white' : ''}`}>{opt.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </StitchContainer>

              {/* Apply To */}
              <StitchContainer>
                <h4 className="font-medium text-white mb-4">Apply To</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setApplyTo('all')}
                    className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                      applyTo === 'all'
                        ? 'bg-cyan-500/20 border-cyan-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <p className="font-medium">All Pages</p>
                    <p className="text-xs mt-1 opacity-70">Rotate entire document</p>
                  </button>
                  <button
                    onClick={() => setApplyTo('custom')}
                    className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                      applyTo === 'custom'
                        ? 'bg-cyan-500/20 border-cyan-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <p className="font-medium">Custom Pages</p>
                    <p className="text-xs mt-1 opacity-70">Specify particular pages</p>
                  </button>
                </div>

                {applyTo === 'custom' && (
                  <div>
                     <label className="block text-sm text-gray-400 mb-2">Page Numbers (1-{pageCount})</label>
                    <input
                      type="text"
                      value={customPages}
                      onChange={(e) => setCustomPages(e.target.value)}
                      placeholder="e.g., 1, 3, 5-7"
                      className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                )}
              </StitchContainer>
            </div>
          )}

          {/* Progress */}
          {rotating && (
            <StitchContainer>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">Rotating PDF...</p>
                  <p className="text-sm text-gray-400">{progress}% complete</p>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
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
                    <h3 className="text-xl font-semibold text-emerald-400">PDF Rotated Successfully!</h3>
                    <p className="text-sm text-gray-400">Your modified file has been downloaded</p>
                  </div>
                </div>
              </StitchContainer>

              <button
                onClick={() => { setFile(null); setResult(false); setPageCount(0); }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-all"
              >
                Rotate Another PDF
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

      {/* Rotate Button */}
      {file && !result && !rotating && (
        <div className="mt-6">
          <StitchButton 
            onClick={rotatePdf}
            icon={Icons.rotate}
          >
            Rotate PDF
          </StitchButton>
        </div>
      )}
    </ToolLayout>
  );
}
