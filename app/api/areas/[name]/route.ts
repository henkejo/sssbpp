import { NextResponse } from 'next/server';
import { getAverageClosingPointsByHood } from '@/lib/db/queries';
import { findHood, hoodMatchNames } from '@/lib/hoods';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const hood = findHood(decodeURIComponent(name));

    if (!hood) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }

    const stats = await getAverageClosingPointsByHood(hoodMatchNames(hood));

    return NextResponse.json({
      name: hood.name,
      imageUrl: hood.imageUrl,
      aptTypes: stats,
    });
  } catch (error) {
    console.error('Area stats API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
