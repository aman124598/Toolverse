'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function AddPageNumberPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left'>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
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

  const addPageNumbers = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      const fontSize = 12;
      
      pages.forEach((page, index) => {
        const { width } = page.getSize();
        const pageNumber = startNumber + index;
        const text = `${pageNumber}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        let x: number;
        switch (position) {
          case 'bottom-left': x = 40; break;
          case 'bottom-right': x = width - 40 - textWidth; break;
          default: x = (width - textWidth) / 2;
        }
        
        page.drawText(text, {
          x,
          y: 30,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
      
      pdfDoc.setProducer('Toolverse Page Numbers');
      pdfDoc.setCreator('Toolverse');
      
      const numberedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(numberedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setResult(url);
    } catch (err) {
      setError('Failed to add page numbers');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Add Page Numbers"
      description="Add page numbers to your PDF document"
      icon="🔢"
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
            <label className="block text-sm text-gray-400 mb-3">Position</label>
            <div className="flex gap-3">
              {[
                { id: 'bottom-left', label: 'Bottom Left' },
                { id: 'bottom-center', label: 'Bottom Center' },
                { id: 'bottom-right', label: 'Bottom Right' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setPosition(pos.id as typeof position)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    position === pos.id 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start from number</label>
            <input
              type="number"
              min="1"
              value={startNumber}
              onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
              className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
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
          onClick={addPageNumbers}
          disabled={processing}
          className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg
                   hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Adding Page Numbers...' : 'Add Page Numbers'}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-emerald-400 font-medium">✓ Page numbers added!</div>
          </div>
          
          <a
            href={result}
            download={`numbered_${file?.name}`}
            className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-lg text-center transition-colors"
          >
            Download PDF
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
