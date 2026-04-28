'use client';

import { useState, useCallback, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Mobile from '@/lib/mobileAdapters';

export default function PdfEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const loadPdf = (pdfFile: File) => {
    setFile(pdfFile);
    const url = URL.createObjectURL(pdfFile);
    setPdfUrl(url);
    setError(null);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      loadPdf(droppedFile);
    } else { setError('Please drop a PDF file'); }
  }, []);

  const downloadPdf = async () => {
    if (!pdfUrl || !file) return;
    await Mobile.saveFile(file, `edited_${file.name}`);
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  return (
    <ToolLayout title="PDF Editor" description="View, annotate, and work with your PDF documents"
      icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
      gradient="from-fuchsia-500 to-purple-500">
      {!file ? (
        <div onDrop={handleFileDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${dragActive ? 'border-fuchsia-500 bg-fuchsia-500/5' : 'border-white/10 hover:border-white/20'}`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your PDF here to edit</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
            Select PDF<input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info Bar */}
          <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex-1 min-w-0"><p className="font-medium text-white truncate">{file.name}</p><p className="text-xs text-gray-400">{formatSize(file.size)}</p></div>
            <div className="flex gap-2">
              <button onClick={downloadPdf} className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 rounded-lg text-sm font-medium transition-colors">
                Download
              </button>
              <button onClick={() => { setFile(null); setPdfUrl(null); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400">
                Close
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          {pdfUrl && (
            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[700px]"
                title="PDF Editor Viewer"
              />
            </div>
          )}

          {/* Quick Tools */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Quick Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <a href="/rotate-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">🔄</span>
                <span className="text-sm text-gray-300">Rotate</span>
              </a>
              <a href="/merge-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">📎</span>
                <span className="text-sm text-gray-300">Merge</span>
              </a>
              <a href="/split-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">✂️</span>
                <span className="text-sm text-gray-300">Split</span>
              </a>
              <a href="/compress-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">📦</span>
                <span className="text-sm text-gray-300">Compress</span>
              </a>
              <a href="/add-watermark-to-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">💧</span>
                <span className="text-sm text-gray-300">Watermark</span>
              </a>
              <a href="/lock-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">🔒</span>
                <span className="text-sm text-gray-300">Lock</span>
              </a>
              <a href="/delete-pdf-pages" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">🗑️</span>
                <span className="text-sm text-gray-300">Delete Pages</span>
              </a>
              <a href="/add-page-number-to-pdf" className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span className="text-xl">#️⃣</span>
                <span className="text-sm text-gray-300">Page Numbers</span>
              </a>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 rounded-xl p-5 border border-fuchsia-500/20">
            <h4 className="font-medium text-fuchsia-300 mb-3">Tips:</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use the browser&apos;s built-in PDF tools to annotate directly</li>
              <li>• Click the quick tools above to perform specific edits</li>
              <li>• Right-click on the PDF to access print options</li>
              <li>• Use Ctrl+F to search within the document</li>
            </ul>
          </div>
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>}
    </ToolLayout>
  );
}
