import { NextResponse } from 'next/server';
import { getEndingPointsByHood, getLatestCloses } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseLimit(value: string | null, fallback: number): number {
  const limit = Number(value ?? String(fallback));
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitPerArea = parseLimit(searchParams.get('limit'), 25);
    const allLimit = parseLimit(searchParams.get('allLimit'), 50);

    const [areas, allRows] = await Promise.all([
      getEndingPointsByHood(limitPerArea),
      getLatestCloses(allLimit),
    ]);

    const serializeRow = (row: (typeof allRows)[number]) => ({
      ...row,
      availableUntil: row.availableUntil.toISOString(),
    });

    return NextResponse.json({
      areas: areas.map(({ hood, rows }) => ({
        area: hood,
        rows: rows.map(serializeRow),
      })),
      all: allRows.map(serializeRow),
    });
  } catch (error) {
    console.error('Areas API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
