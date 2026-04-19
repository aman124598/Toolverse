import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const newOrder = formData.get('order') as string; // "3,1,2,4" (1-indexed)
    const preset = formData.get('preset') as string || ''; // 'reverse', 'shuffle', 'odd-first', 'even-first'

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

    if (totalPages < 2) {
      return NextResponse.json(
        { error: 'PDF must have at least 2 pages to reorder' },
        { status: 400 }
      );
    }

    let orderIndices: number[];

    if (preset) {
      // Use preset ordering
      switch (preset) {
        case 'reverse':
          orderIndices = Array.from({ length: totalPages }, (_, i) => totalPages - 1 - i);
          break;
        case 'odd-first':
          // All odd pages first, then even pages
          const oddPages = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
          const evenPages = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
          orderIndices = [...oddPages, ...evenPages];
          break;
        case 'even-first':
          const even = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
          const odd = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
          orderIndices = [...even, ...odd];
          break;
        case 'booklet':
          // Booklet order for double-sided printing
          orderIndices = createBookletOrder(totalPages);
          break;
        default:
          return NextResponse.json(
            { error: `Unknown preset: ${preset}. Available: reverse, odd-first, even-first, booklet` },
            { status: 400 }
          );
      }
    } else {
      // Use custom order
      if (!newOrder) {
        return NextResponse.json(
          { error: 'Please specify either an order or a preset' },
          { status: 400 }
        );
      }

      orderIndices = newOrder
        .split(',')
        .map(p => parseInt(p.trim()) - 1) // Convert to 0-indexed
        .filter(i => i >= 0 && i < totalPages);

      if (orderIndices.length !== totalPages) {
        return NextResponse.json({
          error: `Invalid order. Expected ${totalPages} pages, got ${orderIndices.length}. Each page must appear exactly once.`,
        }, { status: 400 });
      }

      // Check for duplicates
      const uniquePages = new Set(orderIndices);
      if (uniquePages.size !== totalPages) {
        return NextResponse.json({
          error: 'Invalid order. Each page number must appear exactly once (no duplicates).',
        }, { status: 400 });
      }

      // Check if order is actually the same as original
      const isOriginalOrder = orderIndices.every((val, idx) => val === idx);
      if (isOriginalOrder) {
        return NextResponse.json({
          error: 'The specified order is the same as the original. No changes needed.',
        }, { status: 400 });
      }
    }

    // Create new PDF with reordered pages
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(sourcePdf, orderIndices);
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
    newPdf.setProducer('Toolverse PDF Page Reorderer');
    newPdf.setCreator('Toolverse');
    newPdf.setModificationDate(new Date());

    const pdfBytes = await newPdf.save();

    // Build new order string for response
    const newOrderStr = orderIndices.map(i => i + 1).join(',');

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reordered_${file.name}"`,
        'X-Total-Pages': totalPages.toString(),
        'X-New-Order': newOrderStr,
        'X-Preset': preset || 'custom',
      },
    });

  } catch (error) {
    console.error('PDF reorder error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder pages. Please try again.' },
      { status: 500 }
    );
  }
}

function createBookletOrder(totalPages: number): number[] {
  // Pad to multiple of 4
  const paddedCount = Math.ceil(totalPages / 4) * 4;
  const sheets: number[] = [];

  for (let i = 0; i < paddedCount / 2; i++) {
    let front, back;
    if (i % 2 === 0) {
      // Front of sheet
      front = paddedCount - i;
      back = i + 1;
    } else {
      front = i + 1;
      back = paddedCount - i;
    }
    // Only add pages that exist in the original
    if (front <= totalPages) sheets.push(front - 1);
    if (back <= totalPages && back !== front) sheets.push(back - 1);
  }

  // Deduplicate while preserving order
  const seen = new Set<number>();
  const result: number[] = [];
  for (const page of sheets) {
    if (!seen.has(page)) {
      seen.add(page);
      result.push(page);
    }
  }

  // If we missed any pages, add them at the end
  for (let i = 0; i < totalPages; i++) {
    if (!seen.has(i)) {
      result.push(i);
    }
  }

  return result;
}
