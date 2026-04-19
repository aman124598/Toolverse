import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const MAX_INPUT_SIZE = 1024 * 1024; // 1MB max markdown input

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const markdown = formData.get('markdown') as string;
    const pageSize = (formData.get('pageSize') as string || 'a4').toLowerCase();
    const marginSize = Math.min(Math.max(parseInt(formData.get('margin') as string || '50'), 20), 150);
    const baseFontSize = Math.min(Math.max(parseInt(formData.get('fontSize') as string || '12'), 8), 24);

    if (!markdown) {
      return NextResponse.json({ error: 'No markdown provided' }, { status: 400 });
    }

    if (new Blob([markdown]).size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: 'Markdown content too large. Maximum size is 1MB' },
        { status: 400 }
      );
    }

    const [pageWidth, pageHeight] = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;

    const pdfDoc = await PDFDocument.create();
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const margin = marginSize;
    const maxWidth = pageWidth - (margin * 2);

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    let pageCount = 1;

    const addNewPage = () => {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      pageCount++;
    };

    const drawText = (
      text: string,
      options: {
        size: number;
        font: typeof regularFont;
        indent?: number;
        color?: ReturnType<typeof rgb>;
        lineHeightMultiplier?: number;
      }
    ) => {
      const lineHeight = options.size * (options.lineHeightMultiplier || 1.5);
      const indent = options.indent || 0;
      const color = options.color || rgb(0, 0, 0);

      if (y - lineHeight < margin) {
        addNewPage();
      }

      // Word wrap
      const words = text.split(' ');
      let line = '';

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const width = options.font.widthOfTextAtSize(testLine, options.size);

        if (width > maxWidth - indent && line) {
          currentPage.drawText(line, {
            x: margin + indent,
            y,
            size: options.size,
            font: options.font,
            color,
          });
          y -= lineHeight;
          if (y < margin) addNewPage();
          line = word;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, {
          x: margin + indent,
          y,
          size: options.size,
          font: options.font,
          color,
        });
        y -= lineHeight;
      }
    };

    const drawHorizontalRule = () => {
      if (y - 20 < margin) addNewPage();
      y -= 10;
      currentPage.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      y -= 10;
    };

    // Clean inline markdown formatting and return clean text with format info
    const stripInlineFormatting = (text: string): string => {
      return text
        .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // bold italic
        .replace(/___(.+?)___/g, '$1')          // bold italic alt
        .replace(/\*\*(.*?)\*\*/g, '$1')        // bold
        .replace(/__(.+?)__/g, '$1')            // bold alt
        .replace(/\*(.*?)\*/g, '$1')            // italic
        .replace(/_(.+?)_/g, '$1')              // italic alt
        .replace(/~~(.*?)~~/g, '$1')            // strikethrough
        .replace(/`([^`]+)`/g, '$1')            // inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links - keep text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image: $1]') // images
        .trim();
    };

    const detectInlineFormat = (text: string): 'boldItalic' | 'bold' | 'italic' | 'code' | 'normal' => {
      if (/\*\*\*/.test(text) || /___/.test(text)) return 'boldItalic';
      if (/\*\*/.test(text) || /__/.test(text)) return 'bold';
      if (/[*_]/.test(text) && !/\*\*/.test(text)) return 'italic';
      if (/`[^`]+`/.test(text)) return 'code';
      return 'normal';
    };

    const getFontForFormat = (format: ReturnType<typeof detectInlineFormat>) => {
      switch (format) {
        case 'boldItalic': return boldItalicFont;
        case 'bold': return boldFont;
        case 'italic': return italicFont;
        case 'code': return monoFont;
        default: return regularFont;
      }
    };

    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let numberedListCounter = 0;
    let taskListMode = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const rawLine = lines[lineIndex];
      const trimmed = rawLine.trim();

      // Handle fenced code blocks (``` ... ```)
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // End code block — render accumulated content
          if (codeBlockContent.length > 0) {
            // Draw code block background
            const codeLineHeight = 10 * 1.4;
            const blockHeight = codeBlockContent.length * codeLineHeight + 16;

            if (y - blockHeight < margin) addNewPage();

            // Background rect
            currentPage.drawRectangle({
              x: margin + 10,
              y: y - blockHeight + 8,
              width: maxWidth - 20,
              height: blockHeight,
              color: rgb(0.95, 0.95, 0.95),
              borderColor: rgb(0.85, 0.85, 0.85),
              borderWidth: 0.5,
            });

            y -= 8;
            for (const codeLine of codeBlockContent) {
              drawText(codeLine || ' ', {
                size: 10,
                font: monoFont,
                indent: 20,
                color: rgb(0.15, 0.15, 0.15),
                lineHeightMultiplier: 1.4,
              });
            }
            y -= 4;
          }
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
          codeBlockContent = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(rawLine);
        continue;
      }

      // Empty line
      if (!trimmed) {
        y -= baseFontSize * 0.5;
        numberedListCounter = 0;
        taskListMode = false;
        continue;
      }

      // Horizontal rules
      if (/^[-*_]{3,}\s*$/.test(trimmed)) {
        drawHorizontalRule();
        continue;
      }

      // Headings (# to ######)
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = stripInlineFormatting(headingMatch[2]);
        const sizes = [
          baseFontSize * 2,     // h1
          baseFontSize * 1.65,  // h2
          baseFontSize * 1.35,  // h3
          baseFontSize * 1.17,  // h4
          baseFontSize * 1.0,   // h5
          baseFontSize * 0.92,  // h6
        ];
        const headingSize = sizes[level - 1] || baseFontSize;
        const headingColor = level >= 5 ? rgb(0.3, 0.3, 0.3) : rgb(0, 0, 0);

        y -= 4;
        drawText(headingText, { size: headingSize, font: boldFont, color: headingColor });

        // Draw underline for h1 and h2
        if (level <= 2) {
          currentPage.drawLine({
            start: { x: margin, y: y + 4 },
            end: { x: pageWidth - margin, y: y + 4 },
            thickness: level === 1 ? 1.5 : 0.75,
            color: rgb(0.8, 0.8, 0.8),
          });
          y -= 4;
        }
        y -= 2;
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith('>')) {
        const quoteText = stripInlineFormatting(trimmed.replace(/^>\s*/, ''));
        if (y - 18 < margin) addNewPage();

        // Draw quote bar
        const barHeight = baseFontSize * 1.5 + 4;
        currentPage.drawRectangle({
          x: margin + 8,
          y: y - barHeight + 6,
          width: 3,
          height: barHeight,
          color: rgb(0.6, 0.6, 0.8),
        });

        drawText(quoteText, {
          size: baseFontSize,
          font: italicFont,
          indent: 20,
          color: rgb(0.35, 0.35, 0.35),
        });
        continue;
      }

      // Task lists - [ ] and [x]
      const taskMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
      if (taskMatch) {
        const checked = taskMatch[1].toLowerCase() === 'x';
        const taskText = stripInlineFormatting(taskMatch[2]);
        const checkmark = checked ? '☑' : '☐';
        drawText(`${checkmark} ${taskText}`, {
          size: baseFontSize,
          font: checked ? italicFont : regularFont,
          indent: 15,
          color: checked ? rgb(0.4, 0.4, 0.4) : rgb(0, 0, 0),
        });
        continue;
      }

      // Unordered lists
      if (/^[-*+]\s/.test(trimmed)) {
        const listText = stripInlineFormatting(trimmed.replace(/^[-*+]\s+/, ''));
        const format = detectInlineFormat(trimmed.replace(/^[-*+]\s+/, ''));
        drawText(`• ${listText}`, {
          size: baseFontSize,
          font: getFontForFormat(format),
          indent: 15,
        });
        numberedListCounter = 0;
        continue;
      }

      // Nested unordered lists (2+ spaces indent)
      if (/^\s{2,}[-*+]\s/.test(rawLine)) {
        const depth = Math.floor((rawLine.length - rawLine.trimStart().length) / 2);
        const listText = stripInlineFormatting(trimmed.replace(/^[-*+]\s+/, ''));
        const bullet = depth === 1 ? '◦' : '▪';
        drawText(`${bullet} ${listText}`, {
          size: baseFontSize,
          font: regularFont,
          indent: 15 + (depth * 15),
        });
        continue;
      }

      // Ordered lists
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (orderedMatch) {
        numberedListCounter++;
        const listText = stripInlineFormatting(orderedMatch[2]);
        const format = detectInlineFormat(orderedMatch[2]);
        drawText(`${numberedListCounter}. ${listText}`, {
          size: baseFontSize,
          font: getFontForFormat(format),
          indent: 15,
        });
        continue;
      }

      // Inline code (entire line)
      if (trimmed.startsWith('`') && trimmed.endsWith('`') && !trimmed.startsWith('```')) {
        const code = trimmed.replace(/^`+|`+$/g, '');
        drawText(code, {
          size: baseFontSize - 1,
          font: monoFont,
          indent: 10,
          color: rgb(0.2, 0.2, 0.2),
        });
        continue;
      }

      // Regular paragraph with inline formatting detection
      const cleanText = stripInlineFormatting(trimmed);
      const format = detectInlineFormat(trimmed);
      drawText(cleanText, {
        size: baseFontSize,
        font: getFontForFormat(format),
      });
    }

    // Handle unclosed code block
    if (inCodeBlock && codeBlockContent.length > 0) {
      for (const codeLine of codeBlockContent) {
        drawText(codeLine || ' ', {
          size: 10,
          font: monoFont,
          indent: 20,
          color: rgb(0.15, 0.15, 0.15),
          lineHeightMultiplier: 1.4,
        });
      }
    }

    // Set document metadata
    pdfDoc.setTitle('Markdown to PDF - Toolverse');
    pdfDoc.setProducer('Toolverse');
    pdfDoc.setCreator('Toolverse Markdown to PDF');
    pdfDoc.setCreationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="markdown_to_pdf.pdf"',
        'X-Page-Count': pageCount.toString(),
      },
    });

  } catch (error) {
    console.error('Markdown to PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to convert markdown to PDF. Please try again.' },
      { status: 500 }
    );
  }
}
