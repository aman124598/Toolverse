import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const subject = formData.get('subject') as string;
    const keywords = formData.get('keywords') as string;
    const creator = formData.get('creator') as string;
    const producer = formData.get('producer') as string;

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
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Track what was changed
    const changes: string[] = [];

    // Set metadata — only update fields that were explicitly provided
    if (title !== null && title !== undefined) {
      pdfDoc.setTitle(title);
      changes.push('title');
    }
    if (author !== null && author !== undefined) {
      pdfDoc.setAuthor(author);
      changes.push('author');
    }
    if (subject !== null && subject !== undefined) {
      pdfDoc.setSubject(subject);
      changes.push('subject');
    }
    if (keywords !== null && keywords !== undefined) {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      pdfDoc.setKeywords(keywordList);
      changes.push('keywords');
    }
    if (creator !== null && creator !== undefined) {
      pdfDoc.setCreator(creator);
      changes.push('creator');
    }
    if (producer !== null && producer !== undefined) {
      pdfDoc.setProducer(producer);
      changes.push('producer');
    }

    // Always update modification date
    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="metadata_${file.name}"`,
        'X-Fields-Updated': changes.join(',') || 'none',
        'X-Page-Count': pdfDoc.getPageCount().toString(),
      },
    });

  } catch (error) {
    console.error('PDF metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to update PDF metadata. Please try again.' },
      { status: 500 }
    );
  }
}

// Read metadata endpoint
export async function PUT(request: NextRequest) {
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
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Gather page info
    const pages = pdfDoc.getPages();
    const pageDetails = pages.map((page, index) => {
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;
      return {
        page: index + 1,
        width: Math.round(width * 100) / 100,
        height: Math.round(height * 100) / 100,
        widthInches: Math.round((width / 72) * 100) / 100,
        heightInches: Math.round((height / 72) * 100) / 100,
        rotation,
        orientation: width > height ? 'landscape' : 'portrait',
      };
    });

    const metadata = {
      title: pdfDoc.getTitle() || '',
      author: pdfDoc.getAuthor() || '',
      subject: pdfDoc.getSubject() || '',
      keywords: pdfDoc.getKeywords() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      creationDate: pdfDoc.getCreationDate()?.toISOString() || '',
      modificationDate: pdfDoc.getModificationDate()?.toISOString() || '',
      pageCount: pdfDoc.getPageCount(),
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      fileName: file.name,
      pages: pageDetails,
    };

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('PDF metadata read error:', error);
    return NextResponse.json(
      { error: 'Failed to read PDF metadata. The file may be corrupted.' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
