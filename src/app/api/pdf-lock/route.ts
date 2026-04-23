import { NextRequest, NextResponse } from 'next/server';
import { encryptPDF } from 'cryptpdf';

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
    const effectiveUserPassword = userPassword || ownerPassword;
    const effectiveOwnerPassword = ownerPassword || userPassword;
    const pdfBytes = await encryptPDF(
      new Uint8Array(arrayBuffer),
      effectiveUserPassword,
      effectiveOwnerPassword,
    );

    // Parse permissions for response
    const permissionList = permissions ? permissions.split(',').map(p => p.trim()) : [];

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="protected_${file.name}"`,
        'X-Protection-Level': ownerPassword ? 'owner+user' : 'user',
        'X-Permissions': permissionList.join(',') || 'none',
        'X-Encryption': 'AES-256',
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
