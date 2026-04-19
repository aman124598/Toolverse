'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';
import { PDFDocument } from 'pdf-lib';

export default function DeletePdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<{ url: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPdf = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setFile(pdfFile);
      setSelectedPages(new Set());
      setResult(null);
      setError(null);
    } catch {
      setError('Failed to load PDF. The file may be corrupted or password-protected.');
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await loadPdf(selectedFile);
    }
  };

  const togglePage = (pageNum: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
  };

  const selectAll = () => {
    const allPages = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    setSelectedPages(allPages);
  };

  const selectNone = () => {
    setSelectedPages(new Set());
  };

  const selectOdd = () => {
    const oddPages = new Set(Array.from({ length: pageCount }, (_, i) => i + 1).filter(n => n % 2 !== 0));
    setSelectedPages(oddPages);
  };

  const selectEven = () => {
    const evenPages = new Set(Array.from({ length: pageCount }, (_, i) => i + 1).filter(n => n % 2 === 0));
    setSelectedPages(evenPages);
  };

  const deletePdfPages = async () => {
    if (!file || selectedPages.size === 0) return;
    
    if (selectedPages.size >= pageCount) {
      setError('You cannot delete all pages. At least one page must remain.');
      return;
    }
    
    setDeleting(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get pages to keep (0-indexed)
      const pagesToKeep = Array.from({ length: pageCount }, (_, i) => i)
        .filter(i => !selectedPages.has(i + 1));
      
      // Create new PDF with only the pages to keep
      const newPdfDoc = await PDFDocument.create();
      const pages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
      pages.forEach(page => newPdfDoc.addPage(page));
      
      newPdfDoc.setProducer('Toolverse PDF Page Deleter');
      newPdfDoc.setCreator('Toolverse');
      
      const newBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(newBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `deleted_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setResult({ url, pages: pagesToKeep.length });
    } catch (err) {
      console.error(err);
      setError('Failed to delete pages from PDF');
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout
      title="Delete PDF Pages"
      description="Selectively remove unwanted pages from your PDF file"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      }
      gradient="from-red-500 to-pink-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={handleFileSelect}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to begin selecting pages to delete"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{pageCount} Pages</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); setPageCount(0); setSelectedPages(new Set()); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={deleting}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </StitchContainer>

          {!result && (
            <>
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={selectAll} className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors">
                  Select All
                </button>
                <button onClick={selectNone} className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors">
                  Select None
                </button>
                <button onClick={selectOdd} className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors">
                  Odd Pages
                </button>
                <button onClick={selectEven} className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors">
                  Even Pages
                </button>
              </div>

              {/* Page Selection */}
              <StitchContainer>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-semibold text-white">Select Pages to Delete</h3>
                   <span className="text-sm font-medium bg-red-500/20 text-red-400 px-3 py-1 rounded-full">{selectedPages.size} Selected</span>
                </div>
                
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => togglePage(pageNum)}
                      className={`relative aspect-square rounded-xl font-bold text-sm transition-all duration-300 flex flex-col items-center justify-center overflow-hidden border ${
                        selectedPages.has(pageNum)
                          ? 'border-red-500 bg-red-500/20 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {selectedPages.has(pageNum) && (
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-shimmer" />
                      )}
                      {selectedPages.has(pageNum) && (
                        <svg className="w-4 h-4 text-red-400 absolute top-1 right-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className="relative z-10">{pageNum}</span>
                    </button>
                  ))}
                </div>
              </StitchContainer>

              {/* Summary */}
              {selectedPages.size > 0 && (
                <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-red-400">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold">{selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} will be permanently deleted</p>
                      <p className="text-xs text-red-400/80 mt-0.5">Leaving {pageCount - selectedPages.size} pages remaining</p>
                    </div>
                  </div>
                </div>
              )}
            </>
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
                    <h3 className="text-xl font-semibold text-emerald-400">Pages Deleted!</h3>
                    <p className="text-sm text-gray-400">Your cleaned PDF ({result.pages} pages) has been downloaded automatically.</p>
                  </div>
                </div>
              </StitchContainer>
              
              <button
                onClick={() => { setFile(null); setResult(null); setPageCount(0); setSelectedPages(new Set()); }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-all"
              >
                Delete Pages from Another PDF
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

      {/* Delete Button */}
      {file && !result && selectedPages.size > 0 && (
        <div className="mt-6">
          <button
            onClick={deletePdfPages}
            disabled={deleting || selectedPages.size >= pageCount}
            className={`w-full group overflow-hidden relative rounded-2xl p-4 font-semibold text-lg transition-all duration-300 ${
              deleting || selectedPages.size >= pageCount
                ? 'opacity-50 cursor-not-allowed grayscale'
                : 'hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer" />
            <div className="absolute inset-1 border border-dashed border-white/40 rounded-xl pointer-events-none" />
            <div className="relative flex items-center justify-center gap-3 text-white">
               {deleting ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
               ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
               )}
              {deleting ? 'Deleting Pages...' : `Delete ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}
            </div>
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
