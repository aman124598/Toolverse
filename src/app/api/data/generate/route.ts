import { NextRequest, NextResponse } from 'next/server';
import { FakeDataGenerator } from '@/lib/fake-data-generator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const count = Math.min(Math.max(parseInt(searchParams.get('count') || '1'), 1), 100);

    const generator = new FakeDataGenerator();
    const data = generator.generateBulk(count);

    return NextResponse.json({
      success: true,
      count,
      data
    });
  } catch (error) {
    console.error('Error generating data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate data'
      },
      { status: 500 }
    );
  }
}
