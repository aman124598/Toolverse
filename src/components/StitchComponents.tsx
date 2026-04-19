'use client';

import React from 'react';

// A container with a "stitched" border effect
export function StitchContainer({ children, className = '', noPadding = false }: { children: React.ReactNode, className?: string, noPadding?: boolean }) {
  return (
    <div className={`relative rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 group transition-all duration-300 ${className}`}>
      {/* Stitch overlay */}
      <div className="absolute inset-2 border-[1.5px] border-dashed border-white/10 rounded-xl pointer-events-none group-hover:border-white/20 transition-colors duration-300" />
      <div className={`relative z-10 ${noPadding ? '' : 'p-6 sm:p-8'}`}>
        {children}
      </div>
    </div>
  );
}

// A customized stitched dropzone
export function StitchDropzone({ 
  onDrop, 
  title = "Drop your file here", 
  subtitle = "or click to browse", 
  accept = "*", 
  multiple = false,
  onChange,
  fileText = "Select File",
  icon
}: { 
  onDrop: (e: React.DragEvent) => void, 
  title?: string, 
  subtitle?: string, 
  accept?: string, 
  multiple?: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  fileText?: string,
  icon?: React.ReactNode
}) {
  const [dragActive, setDragActive] = React.useState(false);

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        onDrop(e);
      }}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      className={`relative rounded-3xl p-10 sm:p-16 text-center transition-all duration-500 overflow-hidden group ${
        dragActive 
          ? 'bg-purple-500/10' 
          : 'bg-black/30 hover:bg-black/40'
      }`}
    >
      {/* Outer border */}
      <div className={`absolute inset-0 border-2 rounded-3xl transition-colors duration-500 ${dragActive ? 'border-purple-500/50' : 'border-white/5 group-hover:border-white/10'}`} />
      
      {/* Inner stitched border */}
      <div className={`absolute inset-3 border-2 border-dashed rounded-2xl pointer-events-none transition-all duration-500 ${dragActive ? 'border-purple-500/40 scale-[0.98]' : 'border-white/10 group-hover:border-white/20'}`} />

      <div className="relative z-10 flex flex-col items-center">
        <div className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          dragActive 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
            : 'bg-gradient-to-br from-white/5 to-white/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20'
        }`}>
          {icon || (
            <svg className={`w-10 h-10 transition-colors duration-500 ${dragActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </div>
        
        <h3 className="text-2xl font-semibold mb-2 text-white/90">{title}</h3>
        <p className="text-gray-400 text-lg mb-8">{subtitle}</p>
        
        <label className="relative inline-flex items-center justify-center cursor-pointer group/btn">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-60 group-hover/btn:opacity-100 transition-opacity duration-300" />
          <div className="relative px-8 py-3.5 bg-background rounded-xl border border-white/10 font-semibold text-white transition-all duration-300 group-hover/btn:bg-transparent">
            {fileText}
          </div>
          <input 
            type="file" 
            accept={accept} 
            multiple={multiple} 
            onChange={onChange} 
            className="hidden" 
          />
        </label>
      </div>
    </div>
  );
}

// A primary button with stitch styling
export function StitchButton({ 
  onClick, 
  disabled, 
  loading, 
  children,
  icon
}: { 
  onClick?: () => void, 
  disabled?: boolean, 
  loading?: boolean, 
  children: React.ReactNode,
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full group overflow-hidden rounded-2xl p-4 font-semibold text-lg transition-all duration-300 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed grayscale' 
          : 'hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] hover:-translate-y-1'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-shimmer" />
      <div className="absolute inset-1 border border-dashed border-white/40 rounded-xl pointer-events-none" />
      <div className="relative flex items-center justify-center gap-3 text-white">
        {loading ? (
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon}
        {children}
      </div>
    </button>
  );
}
