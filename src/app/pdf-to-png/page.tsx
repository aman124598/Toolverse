'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';
import Mobile from '@/lib/mobileAdapters';

export default function PdfToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const loadPdf = async (pdfFile: File) => {
    try {
      const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
      setPageCount(pdf.getPageCount());
      setFile(pdfFile);
      setError(null);
    } catch { setError('Failed to load PDF.'); }
  };

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') await loadPdf(droppedFile);
    else setError('Please drop a PDF file');
  }, []);

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  return (
    <ToolLayout title="PDF to PNG" description="Convert PDF pages to high-quality PNG images"
      icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      gradient="from-teal-500 to-cyan-500">
      {!file ? (
        <div onDrop={handleFileDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${dragActive ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 hover:border-white/20'}`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
            Select PDF<input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex-1"><p className="font-medium text-white">{file.name}</p><p className="text-sm text-gray-400">{pageCount} pages • {formatSize(file.size)}</p></div>
            <button onClick={() => { setFile(null); setPageCount(0); }} className="p-2 hover:bg-white/5 rounded-lg"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          {/* PDF Viewer with instructions */}
          <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
            <iframe src={URL.createObjectURL(file)} className="w-full h-[500px]" title="PDF Viewer" />
          </div>

          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl p-5 border border-teal-500/20">
            <h4 className="font-medium text-teal-300 mb-3">How to Save as PNG:</h4>
            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
              <li>Navigate to the page you want to convert</li>
              <li>Use browser print dialog (Ctrl/Cmd + P)</li>
              <li>Select &quot;Save as PDF&quot; or use a PDF to image printer</li>
              <li>Alternatively, use the screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4)</li>
            </ol>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { void Mobile.openUrl(URL.createObjectURL(file)); }} className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg text-sm text-teal-300 transition-colors">
                Open in New Tab
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors">
                Print (Ctrl+P)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a href="/pdf-to-jpg" className="p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-white/5 transition-colors text-center">
              <span className="text-lg block mb-1">🖼️</span>
              <span className="text-sm text-gray-400">Convert to JPG instead</span>
            </a>
            <a href="/pdf-to-text" className="p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-white/5 transition-colors text-center">
              <span className="text-lg block mb-1">📝</span>
              <span className="text-sm text-gray-400">Extract text from PDF</span>
            </a>
          </div>
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>}
    </ToolLayout>
  );
}
