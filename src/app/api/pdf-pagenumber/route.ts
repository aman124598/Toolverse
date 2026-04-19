import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map(r => r.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.toLowerCase() === 'all') {
      for (let i = 0; i < totalPages; i++) pages.add(i);
      continue;
    }
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
          pages.add(i - 1); // Convert to 0-indexed
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

function hexToRgb(hex: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return rgb(0.3, 0.3, 0.3);
  return rgb(
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const position = formData.get('position') as string || 'bottom-center';
    const format = formData.get('format') as string || 'number';
    const fontSize = Math.min(Math.max(parseInt(formData.get('fontSize') as string || '12'), 6), 36);
    const startNumber = Math.max(parseInt(formData.get('startNumber') as string || '1'), 1);
    const margin = Math.min(Math.max(parseInt(formData.get('margin') as string || '30'), 10), 100);
    const fontFamily = formData.get('fontFamily') as string || 'Helvetica';
    const color = formData.get('color') as string || '';
    const pageRange = formData.get('pageRange') as string || 'all';
    const prefix = formData.get('prefix') as string || '';
    const suffix = formData.get('suffix') as string || '';
    const skipPages = formData.get('skipPages') as string || '';

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

    // Select font
    const fontMap: Record<string, string> = {
      Helvetica: 'Helvetica',
      Courier: 'Courier',
      TimesRoman: 'TimesRoman',
    };
    const fontName = fontMap[fontFamily] || 'Helvetica';
    const font = await pdfDoc.embedFont((StandardFonts as Record<string, string>)[fontName]);

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const textColor = color ? hexToRgb(color) : rgb(0.3, 0.3, 0.3);

    // Determine which pages to number
    const pageIndicesToNumber = parsePageRanges(pageRange, totalPages);

    // Pages to skip
    const skipSet = new Set<number>();
    if (skipPages) {
      const skipIndices = parsePageRanges(skipPages, totalPages);
      skipIndices.forEach(i => skipSet.add(i));
    }

    let numberCounter = startNumber;

    pages.forEach((page, index) => {
      // Skip if not in range or explicitly skipped
      if (!pageIndicesToNumber.includes(index) || skipSet.has(index)) return;

      const { width, height } = page.getSize();
      const pageNum = numberCounter++;
      const adjustedTotal = totalPages + startNumber - 1;

      // Build page number text based on format
      let text = '';
      switch (format) {
        case 'page-of':
          text = `${prefix}Page ${pageNum} of ${adjustedTotal}${suffix}`;
          break;
        case 'dash':
          text = `${prefix}- ${pageNum} -${suffix}`;
          break;
        case 'bracket':
          text = `${prefix}[${pageNum}]${suffix}`;
          break;
        case 'roman':
          text = `${prefix}${toRomanNumeral(pageNum)}${suffix}`;
          break;
        case 'alpha':
          text = `${prefix}${toAlpha(pageNum)}${suffix}`;
          break;
        default: // 'number'
          text = `${prefix}${pageNum}${suffix}`;
      }

      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x: number, y: number;
      switch (position) {
        case 'bottom-left':
          x = margin;
          y = margin;
          break;
        case 'bottom-right':
          x = width - textWidth - margin;
          y = margin;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - margin - fontSize;
          break;
        case 'top-left':
          x = margin;
          y = height - margin - fontSize;
          break;
        case 'top-right':
          x = width - textWidth - margin;
          y = height - margin - fontSize;
          break;
        default: // 'bottom-center'
          x = (width - textWidth) / 2;
          y = margin;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: textColor,
      });
    });

    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="numbered_${file.name}"`,
        'X-Total-Pages': totalPages.toString(),
        'X-Pages-Numbered': (numberCounter - startNumber).toString(),
      },
    });

  } catch (error) {
    console.error('PDF page number error:', error);
    return NextResponse.json(
      { error: 'Failed to add page numbers. Please try again.' },
      { status: 500 }
    );
  }
}

function toRomanNumeral(num: number): string {
  const romanMap: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let remaining = Math.min(num, 3999);
  for (const [value, symbol] of romanMap) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

function toAlpha(num: number): string {
  let result = '';
  let n = num;
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}
