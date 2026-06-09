import { NextResponse } from 'next/server';
import { getMonthlyClosingPointsByAptType } from '@/lib/db/queries';
import { findHood, hoodMatchNames } from '@/lib/hoods';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string; aptType: string }> },
) {
  try {
    const { name, aptType } = await params;
    const hood = findHood(decodeURIComponent(name));

    if (!hood) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }

    const monthlyPoints = await getMonthlyClosingPointsByAptType(
      hoodMatchNames(hood),
      decodeURIComponent(aptType),
    );

    return NextResponse.json({
      name: hood.name,
      aptType: decodeURIComponent(aptType),
      imageUrl: hood.imageUrl,
      monthlyPoints,
    });
  } catch (error) {
    console.error('Apartment type stats API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
