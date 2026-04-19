import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const MAX_INPUT_SIZE = 1024 * 1024; // 1MB max HTML input

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
    const html = formData.get('html') as string;
    const pageSize = (formData.get('pageSize') as string || 'a4').toLowerCase();
    const marginSize = Math.min(Math.max(parseInt(formData.get('margin') as string || '50'), 20), 150);

    if (!html) {
      return NextResponse.json({ error: 'No HTML provided' }, { status: 400 });
    }

    if (new Blob([html]).size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: 'HTML content too large. Maximum size is 1MB' },
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

    // Decode HTML entities
    const decodeEntities = (str: string): string => {
      return str
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&bull;/g, '•')
        .replace(/&hellip;/g, '…')
        .replace(/&copy;/g, '©')
        .replace(/&reg;/g, '®')
        .replace(/&trade;/g, '™')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    };

    // Convert HTML to structured text
    const processHtml = (htmlString: string): string => {
      return htmlString
        // Headings
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n[H1]$1[/H1]\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n[H2]$1[/H2]\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n[H3]$1[/H3]\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n[H4]$1[/H4]\n')
        .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n[H5]$1[/H5]\n')
        .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n[H6]$1[/H6]\n')
        // Block elements
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n[BQ]$1[/BQ]\n')
        .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n[CODE]$1[/CODE]\n')
        .replace(/<code[^>]*>(.*?)<\/code>/gi, '[MONO]$1[/MONO]')
        // Lists
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n[LI]$1[/LI]')
        .replace(/<[ou]l[^>]*>/gi, '')
        .replace(/<\/[ou]l>/gi, '\n')
        // Horizontal rule
        .replace(/<hr\s*\/?>/gi, '\n[HR]\n')
        // Line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        // Inline formatting
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '[B]$1[/B]')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '[B]$1[/B]')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '[I]$1[/I]')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '[I]$1[/I]')
        .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
        .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
        // Tables (basic support)
        .replace(/<tr[^>]*>/gi, '\n')
        .replace(/<\/tr>/gi, '')
        .replace(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi, '$1\t')
        // Remove remaining tags
        .replace(/<[^>]+>/g, '')
        // Clean up whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
    };

    const processedText = decodeEntities(processHtml(html));
    const lines = processedText.split('\n');

    let inCodeBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        y -= 8;
        continue;
      }

      // Horizontal rule
      if (trimmed === '[HR]') {
        drawHorizontalRule();
        continue;
      }

      // Code block
      if (trimmed.startsWith('[CODE]')) {
        inCodeBlock = true;
        const codeContent = trimmed.replace('[CODE]', '').replace('[/CODE]', '');
        if (codeContent.trim()) {
          // Draw code background
          const codeLines = codeContent.split('\n');
          for (const codeLine of codeLines) {
            if (codeLine.trim()) {
              drawText(codeLine, { size: 10, font: monoFont, indent: 20, color: rgb(0.2, 0.2, 0.2) });
            }
          }
        }
        if (trimmed.includes('[/CODE]')) inCodeBlock = false;
        continue;
      }
      if (trimmed === '[/CODE]') {
        inCodeBlock = false;
        continue;
      }
      if (inCodeBlock) {
        drawText(trimmed, { size: 10, font: monoFont, indent: 20, color: rgb(0.2, 0.2, 0.2) });
        continue;
      }

      // Headings
      if (trimmed.startsWith('[H1]')) {
        drawText(trimmed.replace('[H1]', '').replace('[/H1]', ''), { size: 24, font: boldFont });
        y -= 8;
        continue;
      }
      if (trimmed.startsWith('[H2]')) {
        drawText(trimmed.replace('[H2]', '').replace('[/H2]', ''), { size: 20, font: boldFont });
        y -= 6;
        continue;
      }
      if (trimmed.startsWith('[H3]')) {
        drawText(trimmed.replace('[H3]', '').replace('[/H3]', ''), { size: 16, font: boldFont });
        y -= 5;
        continue;
      }
      if (trimmed.startsWith('[H4]')) {
        drawText(trimmed.replace('[H4]', '').replace('[/H4]', ''), { size: 14, font: boldFont });
        y -= 4;
        continue;
      }
      if (trimmed.startsWith('[H5]')) {
        drawText(trimmed.replace('[H5]', '').replace('[/H5]', ''), { size: 12, font: boldFont });
        y -= 3;
        continue;
      }
      if (trimmed.startsWith('[H6]')) {
        drawText(trimmed.replace('[H6]', '').replace('[/H6]', ''), { size: 11, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
        y -= 2;
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith('[BQ]')) {
        const content = trimmed.replace('[BQ]', '').replace('[/BQ]', '');
        // Draw quote bar
        if (y - 18 < margin) addNewPage();
        currentPage.drawLine({
          start: { x: margin + 10, y: y + 2 },
          end: { x: margin + 10, y: y - 16 },
          thickness: 3,
          color: rgb(0.7, 0.7, 0.7),
        });
        drawText(content, { size: 12, font: italicFont, indent: 20, color: rgb(0.3, 0.3, 0.3) });
        continue;
      }

      // List items
      if (trimmed.startsWith('[LI]')) {
        const content = trimmed.replace('[LI]', '').replace('[/LI]', '');
        const cleanContent = cleanInlineFormatting(content);
        drawText(`• ${cleanContent}`, { size: 12, font: regularFont, indent: 15 });
        continue;
      }

      // Regular text - handle inline formatting
      const cleanText = cleanInlineFormatting(trimmed);

      // Determine primary formatting
      if (trimmed.includes('[B]') && trimmed.includes('[I]')) {
        drawText(cleanText, { size: 12, font: boldItalicFont });
      } else if (trimmed.includes('[B]')) {
        drawText(cleanText, { size: 12, font: boldFont });
      } else if (trimmed.includes('[I]')) {
        drawText(cleanText, { size: 12, font: italicFont });
      } else if (trimmed.includes('[MONO]')) {
        drawText(cleanText, { size: 11, font: monoFont });
      } else {
        drawText(cleanText, { size: 12, font: regularFont });
      }
    }

    // Set document metadata
    pdfDoc.setTitle('HTML to PDF - Toolverse');
    pdfDoc.setProducer('Toolverse');
    pdfDoc.setCreator('Toolverse HTML to PDF');
    pdfDoc.setCreationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="html_to_pdf.pdf"',
        'X-Page-Count': pageCount.toString(),
      },
    });

  } catch (error) {
    console.error('HTML to PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to convert HTML to PDF. Please try again.' },
      { status: 500 }
    );
  }
}

function cleanInlineFormatting(text: string): string {
  return text
    .replace(/\[B\]/g, '').replace(/\[\/B\]/g, '')
    .replace(/\[I\]/g, '').replace(/\[\/I\]/g, '')
    .replace(/\[MONO\]/g, '').replace(/\[\/MONO\]/g, '')
    .trim();
}
