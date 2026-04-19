'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

export default function SvgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'image/svg+xml' || f.name.endsWith('.svg'));
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setResult(null); setError(null);
    } else { setError('Please drop SVG files'); }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setResult(null); setError(null);
    }
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true); setError(null);
    
    try {
      const pdf = await PDFDocument.create();
      const pageWidth = orientation === 'portrait' ? 595.28 : 841.89;
      const pageHeight = orientation === 'portrait' ? 841.89 : 595.28;
      
      for (const file of files) {
        // Read SVG content
        const svgContent = await file.text();
        
        // Create an Image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        
        // Render to canvas
        const canvas = document.createElement('canvas');
        const scale = 2; // High quality
        canvas.width = img.width * scale || 800;
        canvas.height = img.height * scale || 600;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        
        // Convert to PNG
        const pngBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        const pngBytes = await pngBlob.arrayBuffer();
        const image = await pdf.embedPng(pngBytes);
        
        const page = pdf.addPage([pageWidth, pageHeight]);
        const imgDims = image.scale(1);
        const fitScale = Math.min(pageWidth / imgDims.width, pageHeight / imgDims.height);
        const drawWidth = imgDims.width * fitScale;
        const drawHeight = imgDims.height * fitScale;
        
        page.drawImage(image, {
          x: (pageWidth - drawWidth) / 2,
          y: (pageHeight - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      }
      
      pdf.setProducer('Toolverse SVG to PDF');
      const blob = new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' });
      setResult({ url: URL.createObjectURL(blob), pages: files.length });
    } catch (err) {
      console.error(err);
      setError('Failed to convert SVG files');
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  return (
    <ToolLayout title="SVG to PDF" description="Convert SVG vector graphics to PDF format"
      icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
      gradient="from-yellow-500 to-orange-500">
      <div onDrop={handleFileDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/10 hover:border-white/20'}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Drop SVG files here</h3>
        <p className="text-gray-400 text-sm mb-4">Or click to browse</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
          Add SVG Files<input type="file" accept=".svg,image/svg+xml" multiple onChange={handleFileSelect} className="hidden" />
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-400"><span>{files.length} files • {formatSize(files.reduce((a, f) => a + f.size, 0))}</span>
            <button onClick={() => setFiles([])} className="text-xs text-red-400">Remove all</button></div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center text-sm">{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{file.name}</p><p className="text-xs text-gray-500">{formatSize(file.size)}</p></div>
                <button onClick={() => removeFile(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">×</button>
              </div>
            ))}
          </div>
          {!result && (
            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <label className="text-xs text-gray-500 mb-2 block">Page Orientation</label>
              <div className="flex gap-2">{(['portrait', 'landscape'] as const).map(o => (
                <button key={o} onClick={() => setOrientation(o)} className={`flex-1 py-2 rounded-lg text-sm ${orientation === o ? 'bg-yellow-500' : 'bg-white/5 text-gray-400'}`}>{o}</button>
              ))}</div>
            </div>
          )}
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>}
      {files.length > 0 && !result && (
        <button onClick={convertToPdf} disabled={processing} className="mt-6 w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-semibold text-lg hover:opacity-90 disabled:opacity-50">
          {processing ? 'Converting...' : `Convert ${files.length} SVG${files.length !== 1 ? 's' : ''} to PDF`}
        </button>
      )}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center"><svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
            <div><h3 className="font-semibold text-emerald-400">PDF Created!</h3><p className="text-sm text-gray-400">{result.pages} pages generated</p></div>
          </div>
          <a href={result.url} download="svg_to_pdf.pdf" className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-center hover:opacity-90">Download PDF</a>
          <button onClick={() => { setFiles([]); setResult(null); }} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400">Convert More</button>
        </div>
      )}
    </ToolLayout>
  );
}
