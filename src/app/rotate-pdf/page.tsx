'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [rotating, setRotating] = useState(false);
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

  const rotatePdf = async () => {
    if (!file) return;
    
    setRotating(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });
      
      pdfDoc.setProducer('Toolverse PDF Rotator');
      pdfDoc.setCreator('Toolverse');
      
      const rotatedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(rotatedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setResult(url);
    } catch (err) {
      setError('Failed to rotate PDF');
      console.error(err);
    } finally {
      setRotating(false);
    }
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate all pages in your PDF document"
      icon="🔄"
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

      {/* Rotation Options */}
      {file && !result && (
        <div className="mt-6">
          <label className="block text-sm text-gray-400 mb-3">Rotation Angle</label>
          <div className="flex gap-3">
            {[90, 180, 270].map((deg) => (
              <button
                key={deg}
                onClick={() => setRotation(deg as 90 | 180 | 270)}
                className={`flex-1 py-4 rounded-xl font-medium transition-all ${
                  rotation === deg 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Rotate Button */}
      {file && !result && (
        <button
          onClick={rotatePdf}
          disabled={rotating}
          className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg
                   hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rotating ? 'Rotating...' : `Rotate ${rotation}° Clockwise`}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-emerald-400 font-medium">✓ PDF rotated successfully!</div>
          </div>
          
          <a
            href={result}
            download={`rotated_${file?.name}`}
            className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-lg text-center transition-colors"
          >
            Download Rotated PDF
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
