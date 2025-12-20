import { NextResponse } from 'next/server';
import { getApartment, closeBrowser } from '@/lib/scraper';
import { authoriseApiRequest } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ refId: string }> }
) {
  const authError = authoriseApiRequest(request);
  if (authError) return authError;

  try {
    const { refId } = await params;
    const apartment = await getApartment(refId);
    
    return NextResponse.json({
      success: true,
      apartment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Apartment scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await closeBrowser();
  }
}

