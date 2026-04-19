'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setResult(false);
      setError(null);
    } else {
      setError('Please drop a PDF file');
    }
  }, []);

  const convertToDocx = async () => {
    if (!file) return;
    setConverting(true);
    setProgress(10);
    setProgressText('Uploading PDF...');
    setError(null);

    try {
      // Upload PDF to server for text extraction
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);
      setProgressText('Extracting text from PDF...');

      const response = await fetch('/api/pdf-extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract text from PDF');
      }

      const data = await response.json();
      
      setProgress(60);
      setProgressText('Creating Word document...');

      const title = data.info?.Title || file.name.replace('.pdf', '');
      const author = data.info?.Author || 'Unknown Author';
      const extractedText = data.text || '';
      const numPages = data.numPages || 0;

      // Split text into paragraphs
      const paragraphs = extractedText
        .split(/\n\n+/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      setProgress(80);
      setProgressText('Formatting document...');

      // Create DOCX document with extracted text
      const doc = new Document({
        creator: 'Toolverse PDF to Word Converter',
        title: title,
        styles: {
          paragraphStyles: [
            {
              id: 'Normal',
              name: 'Normal',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Calibri',
                size: 24,
              },
              paragraph: {
                spacing: { line: 276, after: 200 },
              },
            },
          ],
        },
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: title,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              
              // Document Info
              new Paragraph({
                children: [
                  new TextRun({ text: 'Converted from: ', italics: true, color: '666666' }),
                  new TextRun({ text: file.name, italics: true, color: '666666' }),
                  new TextRun({ text: ` (${numPages} pages)`, italics: true, color: '666666' }),
                ],
                spacing: { after: 400 },
                alignment: AlignmentType.CENTER,
              }),

              // Extracted text paragraphs
              ...paragraphs.map((text: string) => {
                // Check if it looks like a heading (short, no period at end, possibly all caps)
                const isHeading = text.length < 100 && !text.endsWith('.') && 
                                  (text === text.toUpperCase() || /^[A-Z][A-Za-z\s]+$/.test(text));
                
                if (isHeading) {
                  return new Paragraph({
                    text: text,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 },
                  });
                }
                
                return new Paragraph({
                  text: text,
                  spacing: { after: 200 },
                });
              }),

              // Footer
              new Paragraph({
                children: [
                  new TextRun({ text: '\n\n' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: 'Converted by Toolverse PDF to Word Converter', 
                    italics: true, 
                    size: 20,
                    color: '999999'
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 600 },
              }),
            ],
          },
        ],
      });

      setProgress(95);
      setProgressText('Saving file...');

      // Generate and download DOCX
      const blob = await Packer.toBlob(doc);
      const fileName = file.name.replace('.pdf', '.docx');
      saveAs(blob, fileName);
      
      setProgress(100);
      setProgressText('Complete!');
      setResult(true);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to convert PDF. Please try another file.');
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
      title="PDF to Word" 
      description="Convert PDF documents to editable DOCX format with text extraction"
      icon={
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      gradient="from-blue-600 to-blue-400"
    >
      {!file ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
            dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-400/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl cursor-pointer hover:opacity-90 font-medium">
            Select PDF
            <input 
              type="file" 
              accept=".pdf,application/pdf" 
              onChange={(e) => { 
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setResult(false);
                  setError(null);
                }
              }} 
              className="hidden" 
            />
          </label>
          
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Server-side Processing
            </div>
            <p className="text-xs text-gray-400">Text is extracted on our servers for accurate conversion</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-400/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
            </div>
            <button 
              onClick={() => { setFile(null); setResult(false); }} 
              className="p-2 hover:bg-white/5 rounded-lg"
              disabled={converting}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* PDF Preview */}
          {!result && !converting && (
            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
              <iframe 
                src={URL.createObjectURL(file)} 
                className="w-full h-[300px]" 
                title="PDF Preview" 
              />
            </div>
          )}

          {/* Progress */}
          {converting && (
            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                <div>
                  <p className="font-medium text-white">{progressText}</p>
                  <p className="text-sm text-gray-400">{progress}% complete</p>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-400">Conversion Complete!</h3>
                    <p className="text-sm text-gray-400">Your DOCX file has been downloaded</p>
                  </div>
                </div>
              </div>

              <button
                onClick={convertToDocx}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl font-semibold text-lg hover:opacity-90 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Again
              </button>

              <button
                onClick={() => { setFile(null); setResult(false); }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                Convert Another PDF
              </button>
            </div>
          )}
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
      {file && !result && !converting && (
        <button
          onClick={convertToDocx}
          className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl font-semibold text-lg
                   hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Convert to DOCX
        </button>
      )}
    </ToolLayout>
  );
}
