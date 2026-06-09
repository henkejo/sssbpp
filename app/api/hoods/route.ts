import { NextResponse } from 'next/server';
import { getEndingPointsByHood } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? '25');
    const limitPerHood =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 25;

    const hoods = await getEndingPointsByHood(limitPerHood);

    return NextResponse.json({
      hoods: hoods.map(({ hood, rows }) => ({
        hood,
        rows: rows.map((row) => ({
          ...row,
          availableUntil: row.availableUntil.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error('Hoods API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
