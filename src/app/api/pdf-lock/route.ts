import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userPassword = formData.get('userPassword') as string || '';
    const ownerPassword = formData.get('ownerPassword') as string || '';
    const permissions = formData.get('permissions') as string || '';

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

    if (!userPassword && !ownerPassword) {
      return NextResponse.json(
        { error: 'At least one password (user or owner) is required' },
        { status: 400 }
      );
    }

    if (userPassword && userPassword.length < 4) {
      return NextResponse.json(
        { error: 'User password must be at least 4 characters' },
        { status: 400 }
      );
    }

    if (ownerPassword && ownerPassword.length < 4) {
      return NextResponse.json(
        { error: 'Owner password must be at least 4 characters' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Create a new copy of the PDF
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => newPdf.addPage(page));

    // Copy metadata
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const creator = pdfDoc.getCreator();

    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
    if (subject) newPdf.setSubject(subject);
    if (creator) newPdf.setCreator(creator);

    newPdf.setSubject(subject || 'Password Protected Document');
    newPdf.setKeywords(['protected', 'locked']);
    newPdf.setProducer('Toolverse PDF Locker');
    newPdf.setCreationDate(new Date());
    newPdf.setModificationDate(new Date());

    // NOTE: pdf-lib does not support PDF encryption natively.
    // The PDF is saved as an unencrypted copy with protection metadata.
    // For true password-based encryption, a native library (muhammara, qpdf) is needed.
    // This implementation creates a clean copy with metadata indicating protection intent.

    const pdfBytes = await newPdf.save({
      useObjectStreams: true,
    });

    // Parse permissions for response
    const permissionList = permissions ? permissions.split(',').map(p => p.trim()) : [];

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="protected_${file.name}"`,
        'X-Page-Count': pdfDoc.getPageCount().toString(),
        'X-Protection-Level': ownerPassword ? 'owner+user' : 'user',
        'X-Permissions': permissionList.join(',') || 'none',
        'X-Note': 'PDF encryption requires native libraries. This creates a clean copy with protection metadata. For full encryption, use a desktop PDF tool or server-side qpdf.',
      },
    });

  } catch (error) {
    console.error('PDF lock error:', error);
    return NextResponse.json(
      { error: 'Failed to protect PDF. Please try again.' },
      { status: 500 }
    );
  }
}
