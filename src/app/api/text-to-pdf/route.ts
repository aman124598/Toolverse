import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const MAX_TEXT_SIZE = 512 * 1024; // 512KB max text input

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
};

const FONT_MAP: Record<string, { regular: string; bold: string; italic: string; boldItalic: string }> = {
  Helvetica: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    boldItalic: 'Helvetica-BoldOblique',
  },
  TimesRoman: {
    regular: 'TimesRoman',
    bold: 'TimesRoman-Bold',
    italic: 'TimesRoman-Italic',
    boldItalic: 'TimesRoman-BoldItalic',
  },
  Courier: {
    regular: 'Courier',
    bold: 'Courier-Bold',
    italic: 'Courier-Oblique',
    boldItalic: 'Courier-BoldOblique',
  },
};

function hexToRgb(hex: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return rgb(0, 0, 0);
  return rgb(
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const fontSize = Math.min(Math.max(parseInt(formData.get('fontSize') as string || '12'), 6), 72);
    const fontFamily = formData.get('fontFamily') as string || 'Helvetica';
    const lineSpacing = Math.min(Math.max(parseFloat(formData.get('lineSpacing') as string || '1.5'), 1), 3);
    const pageSize = (formData.get('pageSize') as string || 'a4').toLowerCase();
    const marginSize = Math.min(Math.max(parseInt(formData.get('margin') as string || '50'), 20), 150);
    const textColor = formData.get('textColor') as string || '#000000';
    const showHeader = formData.get('showHeader') === 'true';
    const showFooter = formData.get('showFooter') === 'true';
    const headerText = formData.get('headerText') as string || '';
    const footerText = formData.get('footerText') as string || '';

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (new Blob([text]).size > MAX_TEXT_SIZE) {
      return NextResponse.json(
        { error: `Text too large. Maximum size is ${MAX_TEXT_SIZE / 1024}KB` },
        { status: 400 }
      );
    }

    const [pageWidth, pageHeight] = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
    const color = hexToRgb(textColor);

    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const fontConfig = FONT_MAP[fontFamily] || FONT_MAP.Helvetica;
    const font = await pdfDoc.embedFont((StandardFonts as Record<string, string>)[fontConfig.regular]);
    const headerFooterFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const maxWidth = pageWidth - (marginSize * 2);
    const lineHeight = fontSize * lineSpacing;
    const headerFooterSize = 9;
    const headerFooterMargin = 20;

    // Calculate usable height (accounting for header/footer)
    const topOffset = showHeader ? headerFooterMargin + headerFooterSize + 10 : 0;
    const bottomOffset = showFooter ? headerFooterMargin + headerFooterSize + 10 : 0;
    const usableTop = pageHeight - marginSize - topOffset;
    const usableBottom = marginSize + bottomOffset;

    // Split text by explicit line breaks FIRST, then word-wrap each line
    const paragraphs = text.split(/\r?\n/);
    const wrappedLines: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        wrappedLines.push('');
        continue;
      }

      const words = paragraph.split(/\s+/).filter(w => w.length > 0);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }

    // Paginate and render
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = usableTop;
    let pageNumber = 1;
    const totalLines = wrappedLines.length;

    const addHeaderFooter = (page: typeof currentPage, pgNum: number) => {
      if (showHeader && headerText) {
        const hText = headerText.replace('{page}', pgNum.toString());
        const hWidth = headerFooterFont.widthOfTextAtSize(hText, headerFooterSize);
        page.drawText(hText, {
          x: (pageWidth - hWidth) / 2,
          y: pageHeight - headerFooterMargin,
          size: headerFooterSize,
          font: headerFooterFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        // Draw separator line
        page.drawLine({
          start: { x: marginSize, y: pageHeight - headerFooterMargin - 8 },
          end: { x: pageWidth - marginSize, y: pageHeight - headerFooterMargin - 8 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      }
      if (showFooter) {
        const fText = (footerText || 'Page {page}').replace('{page}', pgNum.toString());
        const fWidth = headerFooterFont.widthOfTextAtSize(fText, headerFooterSize);
        page.drawText(fText, {
          x: (pageWidth - fWidth) / 2,
          y: headerFooterMargin,
          size: headerFooterSize,
          font: headerFooterFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        // Draw separator line
        page.drawLine({
          start: { x: marginSize, y: headerFooterMargin + headerFooterSize + 4 },
          end: { x: pageWidth - marginSize, y: headerFooterMargin + headerFooterSize + 4 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      }
    };

    for (const line of wrappedLines) {
      if (y - lineHeight < usableBottom) {
        addHeaderFooter(currentPage, pageNumber);
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = usableTop;
        pageNumber++;
      }

      if (line === '') {
        y -= lineHeight * 0.5; // Half-line for empty lines (paragraph break)
        continue;
      }

      currentPage.drawText(line, {
        x: marginSize,
        y: y - lineHeight,
        size: fontSize,
        font,
        color,
      });

      y -= lineHeight;
    }

    // Add header/footer to the last page
    addHeaderFooter(currentPage, pageNumber);

    // Set document metadata
    pdfDoc.setTitle('Text to PDF - Toolverse');
    pdfDoc.setProducer('Toolverse');
    pdfDoc.setCreator('Toolverse Text to PDF');
    pdfDoc.setCreationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="text_to_pdf.pdf"',
        'X-Page-Count': pageNumber.toString(),
        'X-Word-Count': wordCount.toString(),
        'X-Character-Count': charCount.toString(),
      },
    });

  } catch (error) {
    console.error('Text to PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to convert text to PDF. Please try again.' },
      { status: 500 }
    );
  }
}
