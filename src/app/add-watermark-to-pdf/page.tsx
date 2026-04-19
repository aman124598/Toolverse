'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#888888');
  const [position, setPosition] = useState<'center' | 'diagonal'>('diagonal');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    } else {
      setError('Please drop a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0.5, g: 0.5, b: 0.5 };
  };

  const addWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setProcessing(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);
      const pages = pdf.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        
        if (position === 'diagonal') {
          page.drawText(watermarkText, {
            x: (width - textWidth * Math.cos(rotation * Math.PI / 180)) / 2,
            y: height / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotation),
          });
        } else {
          page.drawText(watermarkText, {
            x: (width - textWidth) / 2,
            y: height / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
          });
        }
      }
      
      pdf.setProducer('Toolverse Watermark Tool');
      const blob = new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url });
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err) {
      console.error(err);
      setError('Failed to add watermark');
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  return (
    <ToolLayout 
       title="Add Watermark to PDF" 
       description="Stamp text overlaid watermarks to protect your PDF documents"
       icon={Icons.watermark} 
       gradient="from-cyan-500 to-blue-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={handleFileSelect}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to setup watermark stamp"
        />
      ) : (
        <div className="space-y-6">
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{formatSize(file.size)}</span>
                </div>
              </div>
              <button 
                 onClick={() => { setFile(null); setResult(null); }} 
                 className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </StitchContainer>
          
          {!result && (
            <div className="space-y-4">
              <StitchContainer>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">Watermark Text</label>
                  <input 
                     type="text" 
                     value={watermarkText} 
                     onChange={(e) => setWatermarkText(e.target.value)} 
                     className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex justify-between mb-2">
                       <label className="text-sm font-medium text-white">Font Size</label>
                       <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{fontSize}px</span>
                    </div>
                    <input type="range" min="12" max="150" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                       <label className="text-sm font-medium text-white">Opacity</label>
                       <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 items-end">
                  <div>
                    <div className="flex justify-between mb-2">
                       <label className="text-sm font-medium text-white">Rotation</label>
                       <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{rotation}°</span>
                    </div>
                    <input type="range" min="-90" max="90" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Color Picker</label>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 p-1 bg-white/10 rounded-xl overflow-hidden shadow-inner">
                         <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-full cursor-pointer bg-transparent border-0 opacity-0 absolute" style={{ zIndex: 10 }} />
                         <div className="w-full h-full rounded-lg" style={{ backgroundColor: color }} />
                       </div>
                       <input type="text" value={color.toUpperCase()} readOnly className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-300 font-mono text-sm" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Position Orientation</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {(['diagonal', 'center'] as const).map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPosition(p)} 
                        className={`flex-1 py-4 rounded-xl font-medium transition-all duration-300 border ${
                           position === p 
                           ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                           : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                         {p.charAt(0).toUpperCase() + p.slice(1)} Alignment
                      </button>
                    ))}
                  </div>
                </div>
              </StitchContainer>
              
              <StitchContainer className="bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] border-cyan-500/20 h-64 overflow-hidden relative">
                 <div className="absolute top-4 left-4 right-4 text-center">
                    <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">Visualizer</p>
                 </div>
                 <div className="flex items-center justify-center w-full h-full">
                   <div 
                     className="font-bold whitespace-nowrap drop-shadow-lg" 
                     style={{ 
                       color, 
                       opacity, 
                       transform: position === 'diagonal' ? `rotate(-${rotation}deg)` : 'none',
                       fontSize: `${Math.min(fontSize, 72)}px`,
                       textShadow: '0 0 20px rgba(0,0,0,0.5)'
                     }}
                   >
                     {watermarkText || 'PREVIEW'}
                   </div>
                 </div>
              </StitchContainer>
            </div>
          )}
        </div>
      )}
      
      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium">{error}</div>}
      
      {file && !result && !processing && (
        <div className="mt-6">
          <StitchButton onClick={addWatermark} disabled={!watermarkText.trim()} icon={Icons.watermark}>
            Stamp Watermark
          </StitchButton>
        </div>
      )}
      
      {processing && (
         <div className="mt-6">
           <StitchContainer>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
               </div>
               <div>
                 <p className="font-medium text-white">Stamping Document...</p>
                 <p className="text-sm text-gray-400">Embedding vectors</p>
               </div>
             </div>
           </StitchContainer>
         </div>
      )}
      
      {result && (
        <div className="mt-6 space-y-4">
          <StitchContainer className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <div><h3 className="font-semibold text-emerald-400">Watermark Added Successfully!</h3><p className="text-sm text-gray-400">Your stamped PDF has been automatically downloaded.</p></div>
            </div>
          </StitchContainer>
          <button onClick={() => { setFile(null); setResult(null); }} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-all">Watermark Another Document</button>
        </div>
      )}
    </ToolLayout>
  );
}
