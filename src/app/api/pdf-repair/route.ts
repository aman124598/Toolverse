import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

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
    const originalSize = arrayBuffer.byteLength;

    // Step 1: Try loading with lenient options
    let sourcePdf: PDFDocument;
    let loadMethod = 'standard';
    const issues: string[] = [];

    try {
      sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      loadMethod = 'standard';
    } catch (firstError) {
      issues.push('Initial load failed, attempting recovery mode');

      try {
        // Try loading the raw bytes more aggressively
        // Convert to Uint8Array and try again
        const uint8Array = new Uint8Array(arrayBuffer);
        sourcePdf = await PDFDocument.load(uint8Array, {
          ignoreEncryption: true,
          updateMetadata: false,
        });
        loadMethod = 'recovery';
      } catch (secondError) {
        return NextResponse.json({
          error: 'Unable to load PDF. The file appears to be severely corrupted or is not a valid PDF.',
          details: firstError instanceof Error ? firstError.message : 'Unknown error',
        }, { status: 400 });
      }
    }

    const originalPageCount = sourcePdf.getPageCount();

    if (originalPageCount === 0) {
      return NextResponse.json(
        { error: 'PDF has no pages to repair' },
        { status: 400 }
      );
    }

    // Step 2: Create a completely new PDF by copying pages
    const newPdf = await PDFDocument.create();
    const recoveredPages: number[] = [];
    const corruptedPages: number[] = [];

    // Try to copy all pages at once first (faster for large documents)
    let bulkCopySucceeded = false;
    try {
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => newPdf.addPage(page));
      bulkCopySucceeded = true;
      for (let i = 0; i < originalPageCount; i++) {
        recoveredPages.push(i + 1);
      }
    } catch {
      issues.push('Bulk page copy failed, attempting page-by-page recovery');
    }

    // If bulk copy failed, try page by page
    if (!bulkCopySucceeded) {
      for (let i = 0; i < originalPageCount; i++) {
        try {
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          recoveredPages.push(i + 1);
        } catch {
          corruptedPages.push(i + 1);
          issues.push(`Page ${i + 1} could not be recovered`);
        }
      }
    }

    if (newPdf.getPageCount() === 0) {
      return NextResponse.json({
        error: 'Could not recover any pages from the PDF. The file is too corrupted.',
        corruptedPages,
        issues,
      }, { status: 400 });
    }

    // Step 3: Set fresh metadata
    try {
      const title = sourcePdf.getTitle();
      if (title) newPdf.setTitle(title);
    } catch {
      issues.push('Could not recover title metadata');
    }

    try {
      const author = sourcePdf.getAuthor();
      if (author) newPdf.setAuthor(author);
    } catch {
      issues.push('Could not recover author metadata');
    }

    try {
      const subject = sourcePdf.getSubject();
      if (subject) newPdf.setSubject(subject);
    } catch {
      issues.push('Could not recover subject metadata');
    }

    newPdf.setProducer('Toolverse PDF Repair');
    newPdf.setCreator('Toolverse');
    newPdf.setCreationDate(new Date());
    newPdf.setModificationDate(new Date());

    const pdfBytes = await newPdf.save({
      useObjectStreams: true,
    });

    const repairedSize = pdfBytes.byteLength;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="repaired_${file.name}"`,
        'X-Original-Pages': originalPageCount.toString(),
        'X-Recovered-Pages': recoveredPages.length.toString(),
        'X-Corrupted-Pages': corruptedPages.length.toString(),
        'X-Load-Method': loadMethod,
        'X-Issues-Count': issues.length.toString(),
        'X-Original-Size': originalSize.toString(),
        'X-Repaired-Size': repairedSize.toString(),
      },
    });

  } catch (error) {
    console.error('PDF repair error:', error);
    return NextResponse.json(
      { error: 'Failed to repair PDF. The file may be too corrupted to process.' },
      { status: 500 }
    );
  }
}
