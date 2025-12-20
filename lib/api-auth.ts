import { NextResponse } from 'next/server';

export function authoriseApiRequest(request: Request): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader) {
    const expectedCronAuth = `Bearer ${cronSecret}`;
    if (authHeader === expectedCronAuth) {
      return null;
    }
    if (authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Invalid cron secret' },
        { status: 401 }
      );
    }
  }
  
  const apiKey = request.headers.get('X-API-Key') || authHeader?.replace('Bearer ', '');
  const expectedApiKey = process.env.API_KEY;

  if (!expectedApiKey) {
    console.error('API_KEY environment variable is not set');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing API key' },
      { status: 401 }
    );
  }

  return null;
}
