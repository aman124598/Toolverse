import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string || '';

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

    // Strategy: Try to load the PDF in progressively more permissive ways
    let sourcePdf: PDFDocument | null = null;
    let unlockMethod = 'none';

    // Step 1: Try loading with the provided password (without ignoring encryption)
    if (password) {
      try {
        sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: false,
        });
        unlockMethod = 'password';
      } catch {
        // Password didn't work or encryption type not supported
        sourcePdf = null;
      }
    }

    // Step 2: Try loading without any password (might not be encrypted, or permissions-only lock)
    if (!sourcePdf) {
      try {
        sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: false,
        });
        unlockMethod = 'no-encryption';
      } catch {
        sourcePdf = null;
      }
    }

    // Step 3: Fall back to ignoring encryption (strips permissions-based restrictions)
    if (!sourcePdf) {
      try {
        sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        unlockMethod = 'bypass';
      } catch {
        return NextResponse.json({
          error: 'Failed to unlock PDF. The file may use encryption that is not supported, or the password is incorrect.',
        }, { status: 400 });
      }
    }

    if (!sourcePdf) {
      return NextResponse.json({
        error: 'Unable to process this PDF file.',
      }, { status: 400 });
    }

    // Create a new unprotected copy
    const newPdf = await PDFDocument.create();

    try {
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => newPdf.addPage(page));
    } catch {
      // Try page by page if bulk copy fails
      let recoveredPages = 0;
      for (let i = 0; i < sourcePdf.getPageCount(); i++) {
        try {
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          recoveredPages++;
        } catch {
          console.warn(`Could not copy page ${i + 1} during unlock`);
        }
      }

      if (recoveredPages === 0) {
        return NextResponse.json({
          error: 'Could not extract any pages from the encrypted PDF.',
        }, { status: 400 });
      }
    }

    // Copy metadata to new document
    const title = sourcePdf.getTitle();
    const author = sourcePdf.getAuthor();
    const subject = sourcePdf.getSubject();
    const creator = sourcePdf.getCreator();

    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
    if (subject) newPdf.setSubject(subject);
    if (creator) newPdf.setCreator(creator);
    newPdf.setProducer('Toolverse PDF Unlocker');
    newPdf.setCreationDate(new Date());
    newPdf.setModificationDate(new Date());

    const pdfBytes = await newPdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="unlocked_${file.name}"`,
        'X-Page-Count': newPdf.getPageCount().toString(),
        'X-Unlock-Method': unlockMethod,
        'X-Original-Size': arrayBuffer.byteLength.toString(),
        'X-Unlocked-Size': pdfBytes.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('PDF unlock error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock PDF. Please try again.' },
      { status: 500 }
    );
  }
}
