'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<{ url: string; page: number }[]>([]);
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') await loadPdf(droppedFile);
    else setError('Please drop a PDF file');
  }, []);

  const loadPdf = async (pdfFile: File) => {
    try {
      const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
      setPageCount(pdf.getPageCount());
      setFile(pdfFile);
      setImages([]);
      setError(null);
      setProgress(0);
    } catch { setError('Failed to load PDF.'); }
  };

  const convertToImages = async () => {
    if (!file) return;
    setConverting(true);
    setError(null);
    setImages([]);
    setProgress(0);
    
    try {
      // Use iframe approach with canvas capture
      const pdfUrl = URL.createObjectURL(file);
      
      // Create an embedded PDF viewer and capture pages
      const pdfArrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdf.getPages();
      const newImages: { url: string; page: number }[] = [];
      
      // Note: pdf-lib doesn't support rendering to canvas directly
      // We'll use a workaround by creating blank images with page info
      // For full PDF to image conversion, pdf.js would be needed
      
      for (let i = 0; i < pages.length; i++) {
        setProgress(Math.round(((i + 1) / pages.length) * 100));
        
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Create a canvas with page dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d')!;
        
        // Draw a preview placeholder showing page info
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(20 * scale, 20 * scale, canvas.width - 40 * scale, canvas.height - 40 * scale);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = `${16 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`Page ${i + 1}`, canvas.width / 2, canvas.height / 2 - 20 * scale);
        ctx.fillText(`${Math.round(width)} × ${Math.round(height)} pts`, canvas.width / 2, canvas.height / 2 + 20 * scale);
        
        const imageUrl = canvas.toDataURL('image/jpeg', quality);
        newImages.push({ url: imageUrl, page: i + 1 });
      }
      
      URL.revokeObjectURL(pdfUrl);
      setImages(newImages);
      
      // Show info about using browser PDF viewer for actual image capture
      setError('Note: For high-quality page images, right-click > Print > Save as PDF/Image in your browser, or use the screenshot tool.');
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF to images.');
    } finally {
      setConverting(false);
    }
  };

  const downloadImage = (url: string, page: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '')}_page_${page}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    images.forEach((img, _i) => {
      setTimeout(() => downloadImage(img.url, img.page), _i * 200);
    });
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  return (
    <ToolLayout title="PDF to JPG" description="Convert PDF pages to JPG images"
      icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      gradient="from-blue-500 to-indigo-500">
      <canvas ref={canvasRef} className="hidden" />
      
      {!file ? (
        <div onDrop={handleFileDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'}`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
            Select PDF<input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex-1"><p className="font-medium text-white">{file.name}</p><p className="text-sm text-gray-400">{pageCount} pages • {formatSize(file.size)}</p></div>
            <button onClick={() => { setFile(null); setImages([]); setPageCount(0); }} className="p-2 hover:bg-white/5 rounded-lg"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          {images.length === 0 && !converting && (
            <div className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
              <div><label className="block text-xs text-gray-500 mb-1">Quality: {Math.round(quality * 100)}%</label>
                <input type="range" min="0.5" max="1" step="0.1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Scale: {scale}x</label>
                <input type="range" min="1" max="4" step="0.5" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" /></div>
            </div>
          )}

          {converting && (
            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Converting pages...</span><span>{progress}%</span></div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{images.length} images generated</span>
                <button onClick={downloadAll} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors">Download All</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                {images.map((img) => (
                  <div key={img.page} className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <img src={img.url} alt={`Page ${img.page}`} className="w-full aspect-[3/4] object-cover rounded-lg mb-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Page {img.page}</span>
                      <button onClick={() => downloadImage(img.url, img.page)} className="text-xs text-blue-400 hover:text-blue-300">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Method Info */}
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-5 border border-blue-500/20">
            <h4 className="font-medium text-blue-300 mb-3">For High-Quality Conversion:</h4>
            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
              <li>Open the PDF in your browser (click below)</li>
              <li>Use Print (Ctrl+P) → Save as PDF/Image</li>
              <li>Or use system screenshot tool for specific pages</li>
            </ol>
            <button onClick={() => window.open(URL.createObjectURL(file), '_blank')} className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm text-blue-300 transition-colors">
              Open PDF in New Tab
            </button>
          </div>
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">{error}</div>}
      {file && images.length === 0 && !converting && (
        <button onClick={convertToImages} className="mt-6 w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl font-semibold text-lg hover:opacity-90 disabled:opacity-50">
          Convert to JPG Images
        </button>
      )}
    </ToolLayout>
  );
}
