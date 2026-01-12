'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; pages: number; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setResult(null);
      setError(null);
    } else {
      setError('Please drop PDF files only');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setResult(null);
      setError(null);
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
    if (files.length < 2) return;
    
    setMerging(true);
    setError(null);
    setProgress(0);
    
    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
        totalPages += pages.length;
        setProgress(Math.round(((i + 1) / files.length) * 90));
      }
      
      mergedPdf.setProducer('Toolverse PDF Merger');
      mergedPdf.setCreator('Toolverse');
      
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setProgress(100);
      
      setResult({ url, pages: totalPages, size: mergedBytes.length });
    } catch (err) {
      setError('Failed to merge PDFs. One or more files may be corrupted.');
      console.error(err);
    } finally {
      setMerging(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document"
      icon={Icons.merge}
      gradient="from-blue-500 to-indigo-500"
    >
      {/* Upload Area */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-blue-500 bg-blue-500/5' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Drop PDFs here to merge</h3>
        <p className="text-gray-400 text-sm mb-4">Drag and drop multiple PDF files</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl cursor-pointer hover:opacity-90 transition-opacity font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Files
          <input type="file" accept=".pdf,application/pdf" multiple onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{files.length} files selected • {formatSize(totalSize)}</span>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Remove all
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-black/20 rounded-xl p-4 border border-white/5"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveFile(index, 'up')} 
                    disabled={index === 0}
                    className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => moveFile(index, 'down')} 
                    disabled={index === files.length - 1}
                    className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => removeFile(index)} 
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {merging && (
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Merging PDFs...</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
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

      {/* Merge Button */}
      {files.length >= 2 && !result && !merging && (
        <button
          onClick={mergePdfs}
          className="mt-6 w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl font-semibold text-lg
                   hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Merge {files.length} PDFs
        </button>
      )}

      {files.length === 1 && (
        <p className="mt-4 text-center text-sm text-gray-400">Add at least one more PDF to merge</p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-6">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">PDFs Merged Successfully!</h3>
                <p className="text-sm text-gray-400">{result.pages} pages • {formatSize(result.size)}</p>
              </div>
            </div>
          </div>
          
          <a
            href={result.url}
            download={`merged_${files.length}_files.pdf`}
            className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-lg text-center
                     hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
          >
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Merged PDF
            </span>
          </a>

          <button
            onClick={() => { setFiles([]); setResult(null); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            Merge More PDFs
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
