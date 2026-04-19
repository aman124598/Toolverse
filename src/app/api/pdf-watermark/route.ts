import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function hexToRgb(hex: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: parseInt(match[1], 16) / 255,
    g: parseInt(match[2], 16) / 255,
    b: parseInt(match[3], 16) / 255,
  };
}

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map(r => r.trim()).filter(Boolean);

  for (const part of parts) {
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
    const text = formData.get('text') as string || 'WATERMARK';
    const fontSize = Math.min(Math.max(parseInt(formData.get('fontSize') as string || '50'), 8), 200);
    const opacity = Math.min(Math.max(parseFloat(formData.get('opacity') as string || '0.3'), 0.01), 1);
    const rotation = parseInt(formData.get('rotation') as string || '45');
    const color = formData.get('color') as string || '#888888';
    const position = formData.get('position') as string || 'center';
    const fontFamily = formData.get('fontFamily') as string || 'HelveticaBold';
    const pageRange = formData.get('pageRange') as string || 'all';
    const mode = formData.get('mode') as string || 'single'; // 'single' or 'tiled'
    const tileSpacingX = parseInt(formData.get('tileSpacingX') as string || '200');
    const tileSpacingY = parseInt(formData.get('tileSpacingY') as string || '200');

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

    if (!text.trim()) {
      return NextResponse.json({ error: 'Watermark text cannot be empty' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Select font
    const fontMap: Record<string, string> = {
      Helvetica: 'Helvetica',
      HelveticaBold: 'Helvetica-Bold',
      Courier: 'Courier',
      CourierBold: 'Courier-Bold',
      TimesRoman: 'TimesRoman',
      TimesRomanBold: 'TimesRoman-Bold',
    };
    const fontKey = fontMap[fontFamily] || 'Helvetica-Bold';
    const font = await pdfDoc.embedFont((StandardFonts as Record<string, string>)[fontKey]);

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const { r, g, b } = hexToRgb(color);

    // Determine which pages to watermark
    const pageIndices = parsePageRanges(pageRange, totalPages);

    for (let i = 0; i < pages.length; i++) {
      if (!pageIndices.includes(i)) continue;

      const page = pages[i];
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      if (mode === 'tiled') {
        // Tiled watermark mode - repeat across the page
        const spacingX = Math.max(tileSpacingX, textWidth + 50);
        const spacingY = Math.max(tileSpacingY, fontSize + 50);

        for (let x = -width * 0.3; x < width * 1.3; x += spacingX) {
          for (let y = -height * 0.3; y < height * 1.3; y += spacingY) {
            page.drawText(text, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(r, g, b),
              opacity,
              rotate: degrees(rotation),
            });
          }
        }
      } else {
        // Single watermark mode
        let x: number, y: number;
        let rotAngle = 0;

        switch (position) {
          case 'top-left':
            x = 50;
            y = height - 50 - fontSize;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - 50 - fontSize;
            break;
          case 'top-right':
            x = width - textWidth - 50;
            y = height - 50 - fontSize;
            break;
          case 'bottom-left':
            x = 50;
            y = 50;
            break;
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = 50;
            break;
          case 'bottom-right':
            x = width - textWidth - 50;
            y = 50;
            break;
          case 'diagonal':
            x = width / 2 - textWidth / 2;
            y = height / 2;
            rotAngle = rotation;
            break;
          default: // 'center'
            x = width / 2 - textWidth / 2;
            y = height / 2;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(rotAngle),
        });
      }
    }

    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
        'X-Pages-Watermarked': pageIndices.length.toString(),
        'X-Total-Pages': totalPages.toString(),
        'X-Watermark-Mode': mode,
      },
    });

  } catch (error) {
    console.error('PDF watermark error:', error);
    return NextResponse.json(
      { error: 'Failed to add watermark. Please try again.' },
      { status: 500 }
    );
  }
}
