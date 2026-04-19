'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { StitchContainer, StitchDropzone, StitchButton } from '@/components/StitchComponents';
import { PDFDocument } from 'pdf-lib';

export default function PdfMetadataEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '', author: '', subject: '', keywords: '', creator: '', producer: '',
  });
  const [originalMetadata, setOriginalMetadata] = useState({
    title: '', author: '', subject: '', keywords: '', creator: '', producer: '',
    creationDate: '', modificationDate: '', pageCount: 0,
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') await loadPdf(droppedFile);
    else setError('Please drop a PDF file');
  }, []);

  const loadPdf = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const m = {
        title: pdf.getTitle() || '', author: pdf.getAuthor() || '',
        subject: pdf.getSubject() || '', keywords: pdf.getKeywords() || '',
        creator: pdf.getCreator() || '', producer: pdf.getProducer() || '',
      };
      setFile(pdfFile);
      setMetadata(m);
      setOriginalMetadata({
        ...m, creationDate: pdf.getCreationDate()?.toLocaleString() || 'Not set',
        modificationDate: pdf.getModificationDate()?.toLocaleString() || 'Not set',
        pageCount: pdf.getPageCount(),
      });
      setResult(null); setError(null);
    } catch { setError('Failed to load PDF.'); }
  };

  const saveMetadata = async () => {
    if (!file) return;
    setSaving(true); setError(null);
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      pdf.setTitle(metadata.title); pdf.setAuthor(metadata.author);
      pdf.setSubject(metadata.subject);
      pdf.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdf.setCreator(metadata.creator || 'Toolverse');
      pdf.setProducer(metadata.producer || 'Toolverse');
      pdf.setModificationDate(new Date());
      const blob = new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url });
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `updated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch { setError('Failed to save metadata'); }
    finally { setSaving(false); }
  };

  const formatSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  const hasChanges = Object.keys(metadata).some(k => metadata[k as keyof typeof metadata] !== originalMetadata[k as keyof typeof metadata]);

  return (
    <ToolLayout 
       title="PDF Metadata Editor" 
       description="View and manipulate intrinsic PDF document properties"
       icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
       gradient="from-violet-500 to-purple-500"
    >
      {!file ? (
        <StitchDropzone
          onDrop={handleFileDrop}
          onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])}
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          subtitle="to expose its internal metadata"
        />
      ) : (
        <div className="space-y-6">
          <StitchContainer noPadding>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{originalMetadata.pageCount} Pages</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
              </div>
              <button onClick={() => { setFile(null); setResult(null); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </StitchContainer>
          
          {!result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <StitchContainer>
                   <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Editable Properties
                   </h3>
                   <div className="space-y-4">
                     {(['title', 'author', 'subject', 'keywords'] as const).map(field => (
                       <div key={field}>
                         <label className="block text-xs font-medium text-gray-400 mb-1 capitalize">{field}</label>
                         <input 
                            type="text" 
                            value={metadata[field]} 
                            onChange={(e) => setMetadata({ ...metadata, [field]: e.target.value })} 
                            placeholder={field === 'keywords' ? 'keyword1, keyword2' : `Document ${field}`}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors" 
                         />
                       </div>
                     ))}
                   </div>
                 </StitchContainer>

                 <StitchContainer>
                   <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                       <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       Read-Only Info
                   </h3>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Creation Date</label>
                        <div className="w-full px-4 py-3 bg-black/20 border border-transparent rounded-xl text-gray-300 font-mono text-sm">{originalMetadata.creationDate}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Modification Date</label>
                        <div className="w-full px-4 py-3 bg-black/20 border border-transparent rounded-xl text-gray-300 font-mono text-sm">{originalMetadata.modificationDate}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Software Details</label>
                        <div className="w-full px-4 py-3 bg-black/20 border border-transparent rounded-xl text-gray-300 text-sm space-y-1">
                           <p><span className="text-gray-500">Creator:</span> {originalMetadata.creator || 'N/A'}</p>
                           <p><span className="text-gray-500">Producer:</span> {originalMetadata.producer || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                 </StitchContainer>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium">{error}</div>}
      
      {file && !result && hasChanges && !saving && (
        <div className="mt-6">
           <StitchButton 
             onClick={saveMetadata}
             icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
           >
             Save Metadata Updates
           </StitchButton>
        </div>
      )}
      
      {file && !result && !hasChanges && !saving && (
         <div className="mt-6">
            <button disabled className="w-full py-4 bg-white/5 rounded-2xl font-semibold text-lg opacity-50 cursor-not-allowed">
              Make a change to save
            </button>
         </div>
      )}

      {saving && (
        <div className="mt-6">
           <StitchContainer>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
               </div>
               <div>
                 <p className="font-medium text-white">Saving Dictionary...</p>
                 <p className="text-sm text-gray-400">Rewriting properties</p>
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
                <div><h3 className="font-semibold text-emerald-400 text-xl">Metadata Updated!</h3><p className="text-sm text-gray-400">File downloaded to your machine automatically</p></div>
             </div>
          </StitchContainer>
          <button onClick={() => { setFile(null); setResult(null); }} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors border border-white/10">Edit Another PDF Properties</button>
        </div>
      )}
    </ToolLayout>
  );
}
