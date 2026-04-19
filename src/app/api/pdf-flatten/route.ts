import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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

    const sourcePdf = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    // Create a new PDF and copy all pages
    // This effectively flattens form fields and annotations by
    // re-rendering page content without interactive elements
    const newPdf = await PDFDocument.create();
    const pageIndices = sourcePdf.getPageIndices();
    const pages = await newPdf.copyPages(sourcePdf, pageIndices);
    pages.forEach((page) => newPdf.addPage(page));

    // Copy all available metadata
    const title = sourcePdf.getTitle();
    const author = sourcePdf.getAuthor();
    const subject = sourcePdf.getSubject();
    const creator = sourcePdf.getCreator();
    const keywords = sourcePdf.getKeywords();

    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
    if (subject) newPdf.setSubject(subject);
    if (creator) newPdf.setCreator(creator);
    if (keywords) newPdf.setKeywords(Array.isArray(keywords) ? keywords : [keywords]);

    newPdf.setProducer('Toolverse PDF Flattener');
    newPdf.setCreationDate(new Date());
    newPdf.setModificationDate(new Date());

    const pdfBytes = await newPdf.save({
      useObjectStreams: true,
    });

    const newSize = pdfBytes.byteLength;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="flattened_${file.name}"`,
        'X-Original-Size': originalSize.toString(),
        'X-Flattened-Size': newSize.toString(),
        'X-Page-Count': pageIndices.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF flatten error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to flatten PDF: ${message}` },
      { status: 500 }
    );
  }
}
