import { NextResponse } from 'next/server';
import { scrapeAllApartments } from '@/lib/scraper';
import { validateApiKey } from '@/lib/api-auth';
import { validNonNegativeIntegerParam } from '@/lib/helpers';
import { badRequestError, serverError } from '@/lib/error-handlers';

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const offset = searchParams.get('offset');
  if (offset && !validNonNegativeIntegerParam(offset)) {
    return badRequestError('Invalid offset');
  }
  const limit = searchParams.get('limit');
  if (limit && !validNonNegativeIntegerParam(limit)) {
    return badRequestError('Invalid limit');
  }

  try {
    const apartments = await scrapeAllApartments(offset ? parseInt(offset) : undefined, limit ? parseInt(limit) : undefined);
    return NextResponse.json({
      success: true,
      count: apartments.length,
      apartments,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Full scrape error:', error);
    return serverError(error);
  }
}

