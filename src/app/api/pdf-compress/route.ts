import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for compress (larger files benefit more)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quality = formData.get('quality') as string || 'medium';

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

    // Load with lenient options
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    // Create new PDF by copying pages (strips orphaned objects)
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    pages.forEach((page) => newPdf.addPage(page));

    // Apply quality-based compression strategy
    switch (quality) {
      case 'low':
        // Maximum compression — strip all metadata, use object streams
        newPdf.setProducer('Toolverse');
        break;
      case 'high':
        // Minimal compression — preserve metadata
        copyAllMetadata(sourcePdf, newPdf);
        break;
      case 'medium':
      default:
        // Balanced — copy essential metadata only
        const title = sourcePdf.getTitle();
        const author = sourcePdf.getAuthor();
        if (title) newPdf.setTitle(title);
        if (author) newPdf.setAuthor(author);
        newPdf.setProducer('Toolverse PDF Compressor');
        break;
    }

    newPdf.setModificationDate(new Date());

    // Save with compression options
    const pdfBytes = await newPdf.save({
      useObjectStreams: quality !== 'high', // Object streams for medium/low quality
      addDefaultPage: false,
    });

    const compressedSize = pdfBytes.byteLength;
    const savings = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;
    const compressionRatio = originalSize > 0 ? (originalSize / compressedSize).toFixed(2) : '1.00';

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed_${file.name}"`,
        'X-Original-Size': originalSize.toString(),
        'X-Compressed-Size': compressedSize.toString(),
        'X-Savings-Percent': savings.toString(),
        'X-Compression-Ratio': compressionRatio,
        'X-Page-Count': totalPages.toString(),
        'X-Quality': quality,
      },
    });

  } catch (error) {
    console.error('PDF compress error:', error);
    return NextResponse.json(
      { error: 'Failed to compress PDF. Please try again.' },
      { status: 500 }
    );
  }
}

function copyAllMetadata(source: PDFDocument, target: PDFDocument) {
  const title = source.getTitle();
  const author = source.getAuthor();
  const subject = source.getSubject();
  const creator = source.getCreator();
  const keywords = source.getKeywords();
  const creationDate = source.getCreationDate();

  if (title) target.setTitle(title);
  if (author) target.setAuthor(author);
  if (subject) target.setSubject(subject);
  if (creator) target.setCreator(creator);
  if (keywords) target.setKeywords(Array.isArray(keywords) ? keywords : [keywords]);
  if (creationDate) target.setCreationDate(creationDate);
  target.setProducer('Toolverse PDF Compressor');
}
