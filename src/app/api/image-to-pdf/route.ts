import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per image
const MAX_FILES = 50;
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
  auto: [0, 0], // Auto-size based on image
};

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/gif', 'image/bmp', 'image/svg+xml'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const orientation = formData.get('orientation') as string || 'portrait';
    const fitMode = formData.get('fitMode') as string || 'fit'; // 'fit', 'fill', 'stretch', 'original'
    const pageSize = (formData.get('pageSize') as string || 'a4').toLowerCase();
    const marginSize = Math.max(parseInt(formData.get('margin') as string || '0'), 0);
    const imageQuality = Math.min(Math.max(parseInt(formData.get('quality') as string || '90'), 10), 100);
    const docTitle = formData.get('title') as string || 'Images to PDF';
    const docAuthor = formData.get('author') as string || '';
    const backgroundColor = formData.get('backgroundColor') as string || 'white'; // 'white', 'black', 'transparent'

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files. Maximum is ${MAX_FILES} images` },
        { status: 400 }
      );
    }

    // Validate all files
    let totalSize = 0;
    for (const file of files) {
      if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|tiff?|gif|bmp|svg)$/i)) {
        return NextResponse.json(
          { error: `Unsupported format for "${file.name}". Supported: JPEG, PNG, WebP, TIFF, GIF, BMP, SVG` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" is too large. Maximum per file is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
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

    const pdfDoc = await PDFDocument.create();
    let processedCount = 0;

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get image metadata
        const metadata = await sharp(buffer).metadata();
        const imgWidth = metadata.width || 800;
        const imgHeight = metadata.height || 600;

        // Process image based on quality and format
        let processedBuffer: Buffer;
        let embedMethod: 'png' | 'jpg';

        // Determine if we should use JPEG or PNG
        const hasAlpha = metadata.hasAlpha && backgroundColor === 'transparent';

        if (hasAlpha) {
          // Keep as PNG to preserve transparency
          processedBuffer = await sharp(buffer)
            .png({ quality: imageQuality })
            .toBuffer();
          embedMethod = 'png';
        } else {
          // Convert to JPEG for better compression
          const bg = backgroundColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
          processedBuffer = await sharp(buffer)
            .flatten({ background: bg })
            .jpeg({ quality: imageQuality, mozjpeg: true })
            .toBuffer();
          embedMethod = 'jpg';
        }

        // Determine page dimensions
        let pageWidth: number, pageHeight: number;

        if (pageSize === 'auto') {
          // Page matches image dimensions (72 DPI)
          pageWidth = imgWidth * 72 / (metadata.density || 72);
          pageHeight = imgHeight * 72 / (metadata.density || 72);

          if (orientation === 'landscape' && pageWidth < pageHeight) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
          } else if (orientation === 'portrait' && pageWidth > pageHeight) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
          }
        } else {
          const [baseW, baseH] = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
          pageWidth = orientation === 'landscape' ? baseH : baseW;
          pageHeight = orientation === 'landscape' ? baseW : baseH;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Embed image
        const image = embedMethod === 'jpg'
          ? await pdfDoc.embedJpg(processedBuffer)
          : await pdfDoc.embedPng(processedBuffer);

        // Calculate drawing dimensions based on fit mode
        let drawWidth: number, drawHeight: number, x: number, y: number;
        const availWidth = pageWidth - (marginSize * 2);
        const availHeight = pageHeight - (marginSize * 2);

        switch (fitMode) {
          case 'fill':
            // Fill entire page (no margins), may crop
            drawWidth = pageWidth;
            drawHeight = pageHeight;
            x = 0;
            y = 0;
            break;

          case 'stretch':
            // Stretch to fill available area (distorts aspect ratio)
            drawWidth = availWidth;
            drawHeight = availHeight;
            x = marginSize;
            y = marginSize;
            break;

          case 'original':
            // Original size, centered
            drawWidth = imgWidth;
            drawHeight = imgHeight;
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
            break;

          default: // 'fit'
            // Fit within available area, maintain aspect ratio
            const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
            drawWidth = imgWidth * scale;
            drawHeight = imgHeight * scale;
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
            break;
        }

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        processedCount++;
      } catch (imgError) {
        console.error(`Error processing image ${file.name}:`, imgError);
        // Skip this image but continue with others
      }
    }

    if (processedCount === 0) {
      return NextResponse.json(
        { error: 'No images could be processed. Please check your files.' },
        { status: 400 }
      );
    }

    // Set document metadata
    pdfDoc.setTitle(docTitle);
    if (docAuthor) pdfDoc.setAuthor(docAuthor);
    pdfDoc.setProducer('Toolverse Image to PDF');
    pdfDoc.setCreator('Toolverse');
    pdfDoc.setCreationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="images_to_pdf.pdf"',
        'X-Images-Processed': processedCount.toString(),
        'X-Images-Total': files.length.toString(),
        'X-Page-Count': processedCount.toString(),
        'X-Output-Size': pdfBytes.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Image to PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to convert images to PDF. Please try again.' },
      { status: 500 }
    );
  }
}
