import { NextResponse } from 'next/server';
import { getApartmentList } from '@/lib/scraper';

export async function GET() {
  try {
    const refIds = await getApartmentList();
    return NextResponse.json({
      success: true,
      count: refIds.length,
      refIds,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('List scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

