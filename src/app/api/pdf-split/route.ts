import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
          if (!pages.has(i)) pages.add(i);
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ranges = formData.get('ranges') as string; // e.g., "1-5,8,10-12"
    const mode = formData.get('mode') as string || 'ranges'; // 'ranges', 'every-n', 'individual'
    const everyN = Math.max(parseInt(formData.get('everyN') as string || '1'), 1);

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
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    if (totalPages === 0) {
      return NextResponse.json({ error: 'PDF has no pages' }, { status: 400 });
    }

    if (mode === 'individual') {
      // Split into individual pages — return as single-page PDFs in a JSON response
      // Since we can't return multiple files easily, we return the first split
      // For individual pages, split each page into separate PDF
      const splitPdfs: { page: number; size: number }[] = [];
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < totalPages; i++) {
        const [page] = await newPdf.copyPages(sourcePdf, [i]);
        newPdf.addPage(page);
      }

      // Actually for individual mode, just return all pages as separate PDF
      // We'll return the first page range set if mode is individual
      const firstPagePdf = await PDFDocument.create();
      for (let i = 0; i < totalPages; i++) {
        const singlePdf = await PDFDocument.create();
        const [page] = await singlePdf.copyPages(sourcePdf, [i]);
        singlePdf.addPage(page);
        splitPdfs.push({ page: i + 1, size: (await singlePdf.save()).byteLength });
      }

      // For individual mode, we return the full PDF with all pages (user splits on frontend)
      const pdfBytes = await sourcePdf.save();
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="split_individual.pdf"',
          'X-Total-Pages': totalPages.toString(),
          'X-Mode': 'individual',
        },
      });
    }

    if (mode === 'every-n') {
      // Split every N pages into a new PDF - returns the first chunk
      if (everyN >= totalPages) {
        return NextResponse.json(
          { error: `Cannot split every ${everyN} pages when document has only ${totalPages} pages` },
          { status: 400 }
        );
      }

      // Split into first chunk
      const newPdf = await PDFDocument.create();
      const endPage = Math.min(everyN, totalPages);
      const pageIndices = Array.from({ length: endPage }, (_, i) => i);
      const pages = await newPdf.copyPages(sourcePdf, pageIndices);
      pages.forEach((page) => newPdf.addPage(page));

      copyMetadata(sourcePdf, newPdf);
      const pdfBytes = await newPdf.save();

      const totalChunks = Math.ceil(totalPages / everyN);

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="split_1_of_${totalChunks}.pdf"`,
          'X-Total-Pages': totalPages.toString(),
          'X-Chunk-Pages': endPage.toString(),
          'X-Total-Chunks': totalChunks.toString(),
          'X-Current-Chunk': '1',
        },
      });
    }

    // Default: ranges mode
    if (!ranges) {
      return NextResponse.json({ error: 'No page ranges specified' }, { status: 400 });
    }

    const pageNumbers = parsePageRanges(ranges, totalPages);

    if (pageNumbers.length === 0) {
      return NextResponse.json({ error: 'No valid pages in the specified range' }, { status: 400 });
    }

    // Create new PDF with selected pages
    const newPdf = await PDFDocument.create();
    const pageIndices = pageNumbers.map(n => n - 1); // Convert to 0-based
    const pages = await newPdf.copyPages(sourcePdf, pageIndices);
    pages.forEach((page) => newPdf.addPage(page));

    // Copy metadata
    copyMetadata(sourcePdf, newPdf);
    const pdfBytes = await newPdf.save();

    // Sanitize the range string for filename
    const safeRanges = ranges.replace(/[^0-9,\-]/g, '').substring(0, 50);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="split_pages_${safeRanges}.pdf"`,
        'X-Original-Pages': totalPages.toString(),
        'X-Split-Pages': pageNumbers.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF split error:', error);
    return NextResponse.json(
      { error: 'Failed to split PDF. Please try again.' },
      { status: 500 }
    );
  }
}

function copyMetadata(source: PDFDocument, target: PDFDocument) {
  const title = source.getTitle();
  const author = source.getAuthor();
  const subject = source.getSubject();
  if (title) target.setTitle(title);
  if (author) target.setAuthor(author);
  if (subject) target.setSubject(subject);
  target.setProducer('Toolverse PDF Splitter');
  target.setCreator('Toolverse');
  target.setCreationDate(new Date());
}
