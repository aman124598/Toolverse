'use client';

import { useState, useCallback } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Mobile from '@/lib/mobileAdapters';

export default function AddPageNumberPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [format, setFormat] = useState<'number' | 'page-of' | 'dash'>('number');
  const [fontSize, setFontSize] = useState(12);
  const [startFrom, setStartFrom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPdf = async (pdfFile: File) => {
    try {
      const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
      setPageCount(pdf.getPageCount());
      setFile(pdfFile);
      setResult(null);
      setError(null);
    } catch { setError('Failed to load PDF. Might be encrypted.'); }
  };

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') await loadPdf(droppedFile);
    else setError('Please drop a PDF file');
  }, []);

  const getPageNumberText = (pageNum: number, total: number) => {
    if (format === 'page-of') return `Page ${pageNum} of ${total}`;
    if (format === 'dash') return `- ${pageNum} -`;
    return String(pageNum);
  };

  const addPageNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const totalPages = pages.length;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNum = startFrom + index;
        const text = getPageNumberText(pageNum, totalPages + startFrom - 1);
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let x = width / 2 - textWidth / 2;
        let y = 30;

        if (position.includes('left')) x = 40;
        else if (position.includes('right')) x = width - textWidth - 40;
        if (position.includes('top')) y = height - 40;

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      });

      pdf.setProducer('Toolverse Page Number Tool');
      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      setResult({ url: URL.createObjectURL(blob) });
      await Mobile.saveFile(blob, `numbered_${file.name}`);

    } catch (err) {
      console.error(err);
      setError('Failed to add page numbers');
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(2) + ' MB';

  const positions = [
    { value: 'top-left', label: '↖ Top Left' },
    { value: 'top-center', label: '↑ Top Center' },
    { value: 'top-right', label: '↗ Top Right' },
    { value: 'bottom-left', label: '↙ Bottom Left' },
    { value: 'bottom-center', label: '↓ Bottom Center' },
    { value: 'bottom-right', label: '↘ Bottom Right' },
  ];

  return (
    <ToolLayout
      title="Add Page Numbers to PDF"
      description="Inject elegant page numbering to all pages with custom formatting"
      icon={Icons.pageNumber}
      gradient="from-amber-500 to-orange-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to configure page numbers"
        />
      ) : (
        <div className="space-y-6">
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{pageCount} Pages</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); setPageCount(0); }}
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
                  <label className="block text-sm font-medium text-white mb-3">Position</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {positions.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPosition(p.value as typeof position)}
                        className={`py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 border ${position === p.value
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-3">Number Format</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {[{ v: 'number', l: '1, 2, 3...' }, { v: 'page-of', l: 'Page 1 of N' }, { v: 'dash', l: '- 1 -' }].map(f => (
                      <button
                        key={f.v}
                        onClick={() => setFormat(f.v as typeof format)}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 border ${format === f.v
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                      >
                        {f.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-white">Font Size</label>
                      <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="8" max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-amber-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Start From Page</label>
                    <input
                      type="number"
                      min="1"
                      value={startFrom}
                      onChange={(e) => setStartFrom(Number(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>
              </StitchContainer>

              <StitchContainer className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-4 font-medium uppercase tracking-wider">Live Text Preview</p>
                  <p className="font-medium text-white bg-black/40 border border-white/10 p-4 rounded-xl inline-block shadow-inner" style={{ fontSize: `${Math.min(fontSize, 32)}px` }}>
                    {getPageNumberText(startFrom, pageCount + startFrom - 1)}
                  </p>
                </div>
              </StitchContainer>
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium">{error}</div>}

      {file && !result && !processing && (
        <div className="mt-6">
          <StitchButton onClick={addPageNumbers} icon={Icons.pageNumber}>
            Add Page Numbers
          </StitchButton>
        </div>
      )}

      {processing && (
        <div className="mt-6">
          <StitchContainer>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-medium text-white">Processing Document...</p>
                <p className="text-sm text-gray-400">Embedding font and rendering numbers</p>
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
              <div><h3 className="font-semibold text-emerald-400">Page Numbers Applied!</h3><p className="text-sm text-gray-400">Successfully paginated all {pageCount} pages format.</p></div>
            </div>
          </StitchContainer>
          <button onClick={() => { setFile(null); setResult(null); setPageCount(0); }} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-300 font-medium transition-all border border-white/10">Number Another PDF</button>
        </div>
      )}
    </ToolLayout>
  );
}
