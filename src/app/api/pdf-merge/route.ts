import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILES = 30;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length < 2) {
      return NextResponse.json({ error: 'At least 2 PDF files are required for merging' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files. Maximum is ${MAX_FILES} files` },
        { status: 400 }
      );
    }

    // Validate all files before processing
    let totalSize = 0;
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PDF. All files must be PDFs.` },
          { status: 400 }
        );
      }
      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: `Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Merge PDFs
    const mergedPdf = await PDFDocument.create();
    let totalPagesMerged = 0;
    const fileDetails: { name: string; pages: number }[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const pageCount = sourcePdf.getPageCount();
        const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));

        totalPagesMerged += pageCount;
        fileDetails.push({ name: file.name, pages: pageCount });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json(
          { error: `Failed to process "${file.name}". The file may be corrupted.` },
          { status: 400 }
        );
      }
    }

    // Set merged document metadata
    mergedPdf.setTitle('Merged Document');
    mergedPdf.setProducer('Toolverse PDF Merger');
    mergedPdf.setCreator('Toolverse');
    mergedPdf.setCreationDate(new Date());
    mergedPdf.setModificationDate(new Date());

    const pdfBytes = await mergedPdf.save({
      useObjectStreams: true,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
        'X-Files-Merged': files.length.toString(),
        'X-Total-Pages': totalPagesMerged.toString(),
        'X-Original-Total-Size': totalSize.toString(),
        'X-Merged-Size': pdfBytes.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('PDF merge error:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDFs. Please try again.' },
      { status: 500 }
    );
  }
}
