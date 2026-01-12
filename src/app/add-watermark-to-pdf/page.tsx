'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
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

  const addWatermark = async () => {
    if (!file || !watermarkText) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      const opacityValue = opacity / 100;
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) / 8;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacityValue,
          rotate: degrees(-45),
        });
      }
      
      pdfDoc.setProducer('Toolverse Watermark Tool');
      pdfDoc.setCreator('Toolverse');
      
      const watermarkedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(watermarkedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setResult(url);
    } catch (err) {
      setError('Failed to add watermark');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const presets = ['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'DO NOT COPY', 'INTERNAL USE'];

  return (
    <ToolLayout
      title="Add Watermark"
      description="Add text watermark to all pages of your PDF"
      icon="💧"
    >
      {/* Drop Zone */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 hover:border-white/40'
        }`}
      >
        {file ? (
          <div>
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium text-white">{file.name}</p>
            <button
              onClick={() => { setFile(null); setResult(null); }}
              className="mt-4 text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📤</div>
            <p className="text-lg font-medium text-white mb-2">Drop your PDF here</p>
            <p className="text-gray-400 mb-4">or</p>
            <label className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer transition-colors inline-block">
              Browse Files
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* Options */}
      {file && !result && (
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Watermark Text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value.toUpperCase())}
              placeholder="Enter watermark text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setWatermarkText(preset)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  watermarkText === preset 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Opacity: {opacity}%</label>
            <input
              type="range"
              min="10"
              max="80"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Process Button */}
      {file && !result && (
        <button
          onClick={addWatermark}
          disabled={processing || !watermarkText}
          className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg
                   hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Adding Watermark...' : 'Add Watermark'}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-emerald-400 font-medium">✓ Watermark added successfully!</div>
          </div>
          
          <a
            href={result}
            download={`watermarked_${file?.name}`}
            className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-lg text-center transition-colors"
          >
            Download Watermarked PDF
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
