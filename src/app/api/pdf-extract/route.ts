import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pageRange = formData.get('pageRange') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    let numPages = 0;
    let info: Record<string, string> = {};
    let text = '';
    let wordCount = 0;
    let charCount = 0;

    try {
      // Load PDF with pdf-lib to get metadata
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      numPages = pdfDoc.getPageCount();

      // Gather page dimensions
      const pages = pdfDoc.getPages();
      const pageSizes = pages.map((page, idx) => {
        const { width, height } = page.getSize();
        return {
          page: idx + 1,
          width: Math.round(width * 100) / 100,
          height: Math.round(height * 100) / 100,
          orientation: width > height ? 'landscape' : 'portrait',
        };
      });

      info = {
        Title: pdfDoc.getTitle() || file.name.replace('.pdf', ''),
        Author: pdfDoc.getAuthor() || '',
        Subject: pdfDoc.getSubject() || '',
        Creator: pdfDoc.getCreator() || '',
        Producer: pdfDoc.getProducer() || '',
        CreationDate: pdfDoc.getCreationDate()?.toISOString() || '',
        ModificationDate: pdfDoc.getModificationDate()?.toISOString() || '',
      };

      // Extract text using pdf-parse
      try {
        const buffer = Buffer.from(arrayBuffer);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse/lib/pdf-parse');

        // Configure extraction options
        const parseOptions: Record<string, unknown> = {};

        // If page range is specified, we'll extract and then filter
        const data = await pdfParse(buffer, parseOptions);
        text = data.text || '';

        // If page range specified, try to get just those pages
        if (pageRange && pageRange !== 'all') {
          const requestedPages = parsePageRanges(pageRange, numPages);
          if (requestedPages.length > 0 && requestedPages.length < numPages) {
            // pdf-parse doesn't support page ranges well, so note it in output
            text = `[Extracted from all ${numPages} pages - page-specific extraction not available with this method]\n\n${text}`;
          }
        }
      } catch (parseError) {
        console.error('pdf-parse error:', parseError);
        // Provide fallback text with document info
        text = [
          info.Title || file.name,
          '',
          `This PDF document has ${numPages} page${numPages > 1 ? 's' : ''}.`,
          '',
          `Author: ${info.Author || 'Not specified'}`,
          `Subject: ${info.Subject || 'Not specified'}`,
          `Creator: ${info.Creator || 'Not specified'}`,
          '',
          'Note: Text extraction was not possible for this PDF.',
          'The document may contain scanned images or use non-standard encoding.',
          'Consider using the PDF to OCR tool for scanned documents.',
        ].join('\n');
      }

      // Calculate statistics
      const trimmedText = text.trim();
      wordCount = trimmedText ? trimmedText.split(/\s+/).filter(w => w.length > 0).length : 0;
      charCount = trimmedText.length;

      return NextResponse.json({
        success: true,
        text: trimmedText || `[No text content found in PDF - ${numPages} pages]`,
        numPages,
        info,
        stats: {
          wordCount,
          characterCount: charCount,
          lineCount: trimmedText.split('\n').length,
          fileSize: file.size,
          fileSizeFormatted: formatFileSize(file.size),
        },
        pageSizes,
      });

    } catch (loadError) {
      console.error('PDF load error:', loadError);
      return NextResponse.json(
        { error: 'Failed to load PDF. The file may be corrupted or password-protected.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF. Please try again.' },
      { status: 500 }
    );
  }
}

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map(r => r.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(n => n.trim());
      const start = parseInt(startStr);
      const end = endStr.toLowerCase() === 'end' ? totalPages : parseInt(endStr);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(end, totalPages); i++) {
          pages.add(i);
        }
      }
    } else {
      const num = parseInt(part);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        pages.add(num);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
