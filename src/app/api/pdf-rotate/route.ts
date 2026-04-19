import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const VALID_ROTATIONS = [0, 90, 180, 270, -90, -180, -270];

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map(r => r.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.toLowerCase() === 'odd') {
      for (let i = 0; i < totalPages; i += 2) pages.add(i);
      continue;
    }
    if (part.toLowerCase() === 'even') {
      for (let i = 1; i < totalPages; i += 2) pages.add(i);
      continue;
    }
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(n => n.trim());
      const start = parseInt(startStr);
      const end = endStr.toLowerCase() === 'end' ? totalPages : parseInt(endStr);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(end, totalPages); i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const num = parseInt(part);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        pages.add(num - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const rotation = parseInt(formData.get('rotation') as string || '90');
    const pages = formData.get('pages') as string || 'all';

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

    // Validate rotation angle - must be a multiple of 90
    if (rotation % 90 !== 0) {
      return NextResponse.json(
        { error: 'Rotation must be a multiple of 90 degrees (0, 90, 180, 270, -90, etc.)' },
        { status: 400 }
      );
    }

    // Normalize rotation to 0-360 range
    const normalizedRotation = ((rotation % 360) + 360) % 360;

    if (normalizedRotation === 0) {
      return NextResponse.json(
        { error: 'Rotation of 0 degrees has no effect' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const allPages = pdfDoc.getPages();
    const totalPages = allPages.length;

    // Parse page selection with range support
    const pageIndices = parsePageRanges(pages, totalPages);

    if (pageIndices.length === 0) {
      return NextResponse.json(
        { error: 'No valid pages specified for rotation' },
        { status: 400 }
      );
    }

    // Apply rotation
    let rotatedCount = 0;
    for (const index of pageIndices) {
      if (index >= 0 && index < allPages.length) {
        const page = allPages[index];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + normalizedRotation));
        rotatedCount++;
      }
    }

    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rotated_${file.name}"`,
        'X-Total-Pages': totalPages.toString(),
        'X-Rotated-Pages': rotatedCount.toString(),
        'X-Rotation-Degrees': normalizedRotation.toString(),
      },
    });

  } catch (error) {
    console.error('PDF rotate error:', error);
    return NextResponse.json(
      { error: 'Failed to rotate PDF. Please try again.' },
      { status: 500 }
    );
  }
}
