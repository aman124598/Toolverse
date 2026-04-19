import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function parsePageSelection(input: string, totalPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = input.split(',').map(r => r.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.toLowerCase() === 'odd') {
      for (let i = 1; i <= totalPages; i += 2) pages.add(i);
      continue;
    }
    if (part.toLowerCase() === 'even') {
      for (let i = 2; i <= totalPages; i += 2) pages.add(i);
      continue;
    }
    if (part.toLowerCase() === 'last') {
      pages.add(totalPages);
      continue;
    }
    if (part.toLowerCase() === 'first') {
      pages.add(1);
      continue;
    }
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pagesToDelete = formData.get('pages') as string; // "1,3,5" or "1-3,5,7-end"
    const mode = formData.get('mode') as string || 'delete'; // 'delete' or 'keep'

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

    if (!pagesToDelete) {
      return NextResponse.json({ error: 'No pages specified' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    if (totalPages <= 1 && mode === 'delete') {
      return NextResponse.json(
        { error: 'Cannot delete pages from a single-page PDF' },
        { status: 400 }
      );
    }

    // Parse page selection
    const selectedPages = parsePageSelection(pagesToDelete, totalPages);

    if (selectedPages.length === 0) {
      return NextResponse.json({ error: 'No valid pages specified' }, { status: 400 });
    }

    // Determine which pages to keep
    let keepPages: number[];

    if (mode === 'keep') {
      // "Keep only" mode — keep the specified pages, delete the rest
      keepPages = selectedPages;
    } else {
      // "Delete" mode — delete the specified pages, keep the rest
      const deleteSet = new Set(selectedPages);
      keepPages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (!deleteSet.has(i)) {
          keepPages.push(i);
        }
      }
    }

    if (keepPages.length === 0) {
      return NextResponse.json(
        { error: 'Cannot delete all pages from the PDF' },
        { status: 400 }
      );
    }

    // Create new PDF with remaining pages
    const newPdf = await PDFDocument.create();
    const keepIndices = keepPages.map(p => p - 1); // Convert to 0-indexed
    const pages = await newPdf.copyPages(sourcePdf, keepIndices);
    pages.forEach((page) => newPdf.addPage(page));

    // Copy metadata
    const title = sourcePdf.getTitle();
    const author = sourcePdf.getAuthor();
    const subject = sourcePdf.getSubject();
    const creator = sourcePdf.getCreator();

    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
    if (subject) newPdf.setSubject(subject);
    if (creator) newPdf.setCreator(creator);
    newPdf.setProducer('Toolverse PDF Page Manager');
    newPdf.setModificationDate(new Date());

    const pdfBytes = await newPdf.save();

    const deletedCount = totalPages - keepPages.length;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="modified_${file.name}"`,
        'X-Original-Pages': totalPages.toString(),
        'X-New-Pages': keepPages.length.toString(),
        'X-Deleted-Pages': deletedCount.toString(),
        'X-Mode': mode,
      },
    });

  } catch (error) {
    console.error('PDF delete pages error:', error);
    return NextResponse.json(
      { error: 'Failed to delete pages. Please try again.' },
      { status: 500 }
    );
  }
}
