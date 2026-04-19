'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';

export default function RepairPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ originalPages: number; recoveredPages: number } | null>(null);

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

  const repairPdf = async () => {
    if (!file) return;

    setRepairing(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);

      const response = await fetch('/api/pdf-repair', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to repair PDF');
      }

      const originalPages = parseInt(response.headers.get('X-Original-Pages') || '0');
      const recoveredPages = parseInt(response.headers.get('X-Recovered-Pages') || '0');

      const blob = await response.blob();
      
      setProgress(90);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repaired_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setResult({ originalPages, recoveredPages });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to repair PDF');
    } finally {
      setRepairing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout 
      title="Repair PDF" 
      description="Attempt recovery and fix corrupted or damaged PDF documents"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
      gradient="from-green-500 to-emerald-500"
    >
      {!file ? (
        <div className="space-y-6">
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
            title="Drop your corrupted PDF here"
            subtitle="to initiate recovery procedures"
          />
          <StitchContainer className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 max-w-2xl mx-auto">
             <h4 className="font-semibold text-green-400 mb-3 text-sm flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 What can be repaired?
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Corrupted file structure
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Invalid object references
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Incomplete downloads
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Damaged page content
                </div>
             </div>
          </StitchContainer>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <StitchContainer noPadding>
             <div className="flex items-center gap-4 p-5">
               <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                 <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
               </div>
               <div className="flex-1">
                 <p className="font-medium text-white">{file.name}</p>
                 <p className="text-sm text-gray-400 mt-1">{formatSize(file.size)}</p>
               </div>
               <button 
                 onClick={() => { setFile(null); setResult(null); }} 
                 className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                 disabled={repairing}
               >
                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
          </StitchContainer>

          {/* Progress */}
          {repairing && (
             <StitchContainer>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Analyzing & Repairing...</p>
                    <p className="text-sm text-gray-400">{progress}% complete</p>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[linear-gradient(90deg,var(--tw-gradient-stops))] from-green-500 via-emerald-400 to-green-500 bg-[length:200%_100%] animate-shimmer transition-all duration-500" 
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
                     <h3 className="font-semibold text-emerald-400 text-xl">Recovery Successful!</h3>
                     <p className="text-sm text-gray-400">File structure restored and downloaded</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center">
                     <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Original Target</p>
                     <p className="text-2xl font-bold text-white">{result.originalPages} <span className="text-sm font-normal text-gray-500">pages</span></p>
                   </div>
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center">
                     <p className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider mb-2">Recovered</p>
                     <p className="text-2xl font-bold text-emerald-400">{result.recoveredPages} <span className="text-sm font-normal text-emerald-500/50">pages</span></p>
                   </div>
                 </div>
               </StitchContainer>

              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-300 font-medium transition-all border border-white/10"
              >
                Attempt Another Repair
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 font-medium">{error}</span>
        </div>
      )}

      {/* Repair Button */}
      {file && !result && !repairing && (
        <div className="mt-6">
           <StitchButton 
             onClick={repairPdf}
             icon={
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
             }
           >
             Run Recovery Diagnostics
           </StitchButton>
        </div>
      )}
    </ToolLayout>
  );
}
