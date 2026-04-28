'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Mobile from '@/lib/mobileAdapters';

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fitMode, setFitMode] = useState<'fit' | 'fill'>('fit');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<boolean>(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    );
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setError(null);
      setResult(false);
    } else {
      setError('Please drop image files (JPG, PNG, WebP, GIF)');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setError(null);
      setResult(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < files.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;

    setConverting(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('orientation', orientation);
      formData.append('fitMode', fitMode);

      setProgress(30);

      const response = await fetch('/api/image-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert images');
      }

      const blob = await response.blob();

      setProgress(90);

      await Mobile.saveFile(blob, 'images_to_pdf.pdf');

      setProgress(100);
      setResult(true);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to convert images');
    } finally {
      setConverting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout
      title="JPG to PDF"
      description="Convert JPG, PNG, and other images to PDF"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      gradient="from-amber-500 to-orange-500"
    >
      {/* Drop Zone */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-white/10 hover:border-white/20'
          }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Drop images here</h3>
        <p className="text-gray-400 text-sm mb-4">JPG, PNG, WebP, GIF supported</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl cursor-pointer hover:opacity-90 font-medium">
          Add Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{files.length} images</span>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group bg-black/20 rounded-xl border border-white/5 overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 bg-red-500/50 hover:bg-red-500 rounded-lg"
                  >
                    ×
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <div className="absolute top-1 left-1 bg-black/70 px-2 py-0.5 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          {!result && !converting && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <label className="text-sm text-gray-400 mb-2 block">Orientation</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-2 rounded-lg text-sm ${orientation === 'portrait'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/5 text-gray-400'
                      }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-2 rounded-lg text-sm ${orientation === 'landscape'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/5 text-gray-400'
                      }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <label className="text-sm text-gray-400 mb-2 block">Fit Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFitMode('fit')}
                    className={`flex-1 py-2 rounded-lg text-sm ${fitMode === 'fit'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/5 text-gray-400'
                      }`}
                  >
                    Fit
                  </button>
                  <button
                    onClick={() => setFitMode('fill')}
                    className={`flex-1 py-2 rounded-lg text-sm ${fitMode === 'fill'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/5 text-gray-400'
                      }`}
                  >
                    Fill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {converting && (
        <div className="mt-6 bg-black/20 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <div>
              <p className="font-medium text-white">Converting images to PDF...</p>
              <p className="text-sm text-gray-400">{progress}% complete</p>
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">PDF Created Successfully!</h3>
                <p className="text-sm text-gray-400">{files.length} images converted to PDF</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setFiles([]); setResult(false); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            Convert More Images
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Convert Button */}
      {files.length > 0 && !result && !converting && (
        <button
          onClick={convertToPdf}
          className="mt-6 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-semibold text-lg
                   hover:opacity-90 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Convert to PDF
        </button>
      )}
    </ToolLayout>
  );
}
