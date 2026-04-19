'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

export default function PngToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fitMode, setFitMode] = useState<'fit' | 'fill'>('fit');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setResult(null); setError(null);
    } else { setError('Please drop image files'); }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setResult(null); setError(null);
    }
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < files.length) {
      const newFiles = [...files];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true); setError(null);
    
    try {
      const pdf = await PDFDocument.create();
      const pageWidth = orientation === 'portrait' ? 595.28 : 841.89;
      const pageHeight = orientation === 'portrait' ? 841.89 : 595.28;
      
      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/png') {
          image = await pdf.embedPng(imageBytes);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdf.embedJpg(imageBytes);
        } else {
          const img = new Image();
          const url = URL.createObjectURL(file);
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          const pngBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
          image = await pdf.embedPng(await pngBlob.arrayBuffer());
        }
        
        const page = pdf.addPage([pageWidth, pageHeight]);
        const imgDims = image.scale(1);
        const scale = fitMode === 'fit' 
          ? Math.min(pageWidth / imgDims.width, pageHeight / imgDims.height)
          : Math.max(pageWidth / imgDims.width, pageHeight / imgDims.height);
        const drawWidth = imgDims.width * scale;
        const drawHeight = imgDims.height * scale;
        page.drawImage(image, { x: (pageWidth - drawWidth) / 2, y: (pageHeight - drawHeight) / 2, width: drawWidth, height: drawHeight });
      }
      
      pdf.setProducer('Toolverse PNG to PDF');
      const blob = new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' });
      setResult({ url: URL.createObjectURL(blob), pages: files.length });
    } catch (err) {
      console.error(err);
      setError('Failed to convert images');
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  return (
    <ToolLayout title="PNG to PDF" description="Convert PNG images to a PDF document"
      icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      gradient="from-purple-500 to-indigo-500">
      <div onDrop={handleFileDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 hover:border-white/20'}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Drop PNG images here</h3>
        <p className="text-gray-400 text-sm mb-4">Or click to browse files</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
          Add Images<input type="file" accept="image/png,image/jpeg,image/*" multiple onChange={handleFileSelect} className="hidden" />
        </label>
      </div>
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-400"><span>{files.length} images • {formatSize(files.reduce((a, f) => a + f.size, 0))}</span>
            <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">Remove all</button></div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-sm">{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{file.name}</p><p className="text-xs text-gray-500">{formatSize(file.size)}</p></div>
                <button onClick={() => moveFile(i, 'up')} disabled={i === 0} className="p-1 hover:bg-white/5 rounded disabled:opacity-30">↑</button>
                <button onClick={() => moveFile(i, 'down')} disabled={i === files.length - 1} className="p-1 hover:bg-white/5 rounded disabled:opacity-30">↓</button>
                <button onClick={() => removeFile(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">×</button>
              </div>
            ))}
          </div>
          {!result && (
            <div className="bg-black/20 rounded-xl p-4 border border-white/5 grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Orientation</label>
                <div className="flex gap-2">{(['portrait', 'landscape'] as const).map(o => (
                  <button key={o} onClick={() => setOrientation(o)} className={`flex-1 py-2 rounded-lg text-sm ${orientation === o ? 'bg-purple-500' : 'bg-white/5 text-gray-400'}`}>{o}</button>
                ))}</div></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Fit Mode</label>
                <div className="flex gap-2">{(['fit', 'fill'] as const).map(f => (
                  <button key={f} onClick={() => setFitMode(f)} className={`flex-1 py-2 rounded-lg text-sm ${fitMode === f ? 'bg-purple-500' : 'bg-white/5 text-gray-400'}`}>{f}</button>
                ))}</div></div>
            </div>
          )}
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>}
      {files.length > 0 && !result && (
        <button onClick={convertToPdf} disabled={processing} className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl font-semibold text-lg hover:opacity-90 disabled:opacity-50">
          {processing ? 'Converting...' : `Convert ${files.length} Images to PDF`}
        </button>
      )}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center"><svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
            <div><h3 className="font-semibold text-emerald-400">PDF Created!</h3><p className="text-sm text-gray-400">{result.pages} pages</p></div>
          </div>
          <a href={result.url} download="png_to_pdf.pdf" className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-center hover:opacity-90">Download PDF</a>
          <button onClick={() => { setFiles([]); setResult(null); }} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400">Convert More</button>
        </div>
      )}
    </ToolLayout>
  );
}
