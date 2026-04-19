'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setError(null);
      setResult(false);
    } else {
      setError('Please drop PDF files only');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setError(null);
      setResult(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < files.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge');
      return;
    }

    setMerging(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      setProgress(30);

      const response = await fetch('/api/pdf-merge', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge PDFs');
      }

      const blob = await response.blob();
      
      setProgress(90);

      // Download the merged PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs');
    } finally {
      setMerging(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <ToolLayout 
      title="Merge PDF" 
      description="Combine multiple PDF files into one single document seamlessly"
      icon={Icons.merge}
      gradient="from-blue-500 to-indigo-500"
    >
      <StitchDropzone
        onDrop={handleFileDrop}
        onChange={handleFileSelect}
        accept=".pdf,application/pdf"
        multiple
        title="Drop your PDF files here"
        subtitle="or click to browse"
        fileText="Select Multiple PDFs"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between mx-2">
            <span className="text-sm font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {files.length} files • {formatSize(totalSize)}
            </span>
            <button 
              onClick={() => setFiles([])} 
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Remove all
            </button>
          </div>

          <StitchContainer noPadding>
            <div className="max-h-[350px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {files.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 group transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white/90">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                      title="Move Up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                      title="Move Down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </StitchContainer>
        </div>
      )}

      {/* Progress */}
      {merging && (
        <div className="mt-6">
          <StitchContainer>
             <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
               </div>
               <div>
                 <p className="font-medium text-white">Merging PDFs...</p>
                 <p className="text-sm text-gray-400">{progress}% complete</p>
               </div>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
                 style={{ width: `${progress}%` }} 
               />
             </div>
          </StitchContainer>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mt-8 space-y-4">
          <StitchContainer className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-emerald-400">PDFs Merged Successfully!</h3>
                <p className="text-sm text-gray-400">{files.length} files combined into one document</p>
              </div>
            </div>
          </StitchContainer>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 font-medium">{error}</span>
        </div>
      )}

      {/* Merge Button */}
      {files.length >= 2 && !merging && !result && (
        <div className="mt-8">
          <StitchButton 
            onClick={mergePdfs}
            icon={Icons.merge}
          >
            Merge {files.length} PDFs
          </StitchButton>
        </div>
      )}

      {files.length === 1 && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-amber-400/90 text-sm font-medium">Add at least one more PDF to merge</span>
        </div>
      )}
    </ToolLayout>
  );
}
