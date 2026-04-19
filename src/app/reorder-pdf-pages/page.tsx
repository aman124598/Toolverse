'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';
import { PDFDocument } from 'pdf-lib';

interface PageItem {
  originalIndex: number;
  displayIndex: number;
}

export default function ReorderPdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [reordering, setReordering] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const loadPdf = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setFile(pdfFile);
      setPages(Array.from({ length: count }, (_, i) => ({ originalIndex: i, displayIndex: i + 1 })));
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

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newPages = [...pages];
    const [removed] = newPages.splice(draggedItem, 1);
    newPages.splice(index, 0, removed);
    setPages(newPages);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    const newPages = [...pages];
    [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
    setPages(newPages);
  };

  const reverseOrder = () => {
    setPages([...pages].reverse());
  };

  const resetOrder = () => {
    setPages(Array.from({ length: pageCount }, (_, i) => ({ originalIndex: i, displayIndex: i + 1 })));
  };

  const reorderPdf = async () => {
    if (!file || pages.length === 0) return;
    
    setReordering(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      // Copy pages in new order
      const pageIndices = pages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      newPdf.setProducer('Toolverse PDF Page Reorderer');
      newPdf.setCreator('Toolverse');
      
      const newBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(newBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setResult({ url });
    } catch (err) {
      console.error(err);
      setError('Failed to reorder PDF pages');
    } finally {
      setReordering(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const hasChanges = pages.some((page, index) => page.originalIndex !== index);

  return (
    <ToolLayout
      title="Reorder PDF Pages"
      description="Drag and drop or use arrows to rearrange pages smoothly"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      }
      gradient="from-indigo-500 to-purple-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={handleFileSelect}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to begin reordering pages"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{pageCount} Pages</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); setPages([]); setPageCount(0); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={reordering}
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
                <button 
                  onClick={reverseOrder}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Reverse Order
                </button>
                <button 
                  onClick={resetOrder}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Sequence
                </button>
              </div>

              {/* Page List */}
              <StitchContainer>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Interactive Page Map</h3>
                  <span className="text-xs text-gray-400">Drag to reorder</span>
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {pages.map((page, index) => (
                    <div
                      key={page.originalIndex}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-4 bg-black/40 rounded-xl p-3 border transition-all duration-300 cursor-move relative overflow-hidden group ${
                        draggedItem === index 
                          ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {draggedItem === index && (
                         <div className="absolute inset-0 bg-indigo-500/10" />
                      )}
                      
                      {/* Drag Handle Icon */}
                      <div className="text-gray-600 group-hover:text-indigo-400 transition-colors pl-1 cursor-grab">
                        <svg className="w-5 h-5 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${page.originalIndex !== index ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 border border-white/10 text-gray-300'}`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">Original Page {page.displayIndex}</p>
                        {page.originalIndex !== index && (
                          <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full mt-1 inline-block border border-indigo-500/20">Moved from #{page.displayIndex}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => movePage(index, 'up')}
                          disabled={index === 0}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-all border border-transparent hover:border-white/10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => movePage(index, 'down')}
                          disabled={index === pages.length - 1}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-all border border-transparent hover:border-white/10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </StitchContainer>

              {/* Status */}
              {hasChanges && (
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20 flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-indigo-400/90 text-sm">Page sequence has been customized</span>
                </div>
              )}
            </>
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
                    <h3 className="text-xl font-semibold text-emerald-400">Pages Reordered!</h3>
                    <p className="text-sm text-gray-400">Your PDF pages are now perfectly sequenced</p>
                  </div>
                </div>

                <a
                  href={result.url}
                  download={`reordered_${file?.name}`}
                  className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-lg text-center text-white hover:opacity-90 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  Download Masterpiece
                </a>
              </StitchContainer>
              
              <button
                onClick={() => { setFile(null); setResult(null); setPages([]); setPageCount(0); }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-all"
              >
                Reorder Another PDF
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

      {/* Reorder Button */}
      {file && !result && hasChanges && !reordering && (
        <div className="mt-6">
          <StitchButton 
            onClick={reorderPdf}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          >
            Apply New Order
          </StitchButton>
        </div>
      )}
      
      {reordering && (
         <div className="mt-6">
           <StitchContainer>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
               </div>
               <div>
                 <p className="font-medium text-white">Reordering Matrix...</p>
                 <p className="text-sm text-gray-400">Processing pages</p>
               </div>
             </div>
           </StitchContainer>
         </div>
      )}
    </ToolLayout>
  );
}
