import { NextResponse } from 'next/server';
import { scrapeAllApartments } from '@/lib/scraper';

export async function POST() {
  try {
    const apartments = await scrapeAllApartments();
    return NextResponse.json({
      success: true,
      count: apartments.length,
      apartments,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Full scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

