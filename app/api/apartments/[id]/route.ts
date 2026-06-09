import { NextResponse } from 'next/server';
import { getLevelFromAptNr } from '@/lib/apartment';
import {
  getApartmentById,
  getApartmentScrapeHistory,
} from '@/lib/db/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const apartment = await getApartmentById(id);

    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    const scrapeHistory = await getApartmentScrapeHistory(apartment.refId);

    return NextResponse.json({
      hood: apartment.hood,
      address: apartment.address,
      aptType: apartment.aptType,
      aptNr: apartment.aptNr,
      level: getLevelFromAptNr(apartment.aptNr),
      bestPoints: apartment.bestPoints,
      bookers: apartment.bookers,
      availableUntil: serializeDate(apartment.availableUntil),
      moveIn: serializeDate(apartment.moveIn),
      infoLink: apartment.infoLink,
      rent: apartment.rent,
      sqm: apartment.sqm,
      special: apartment.special,
      scrapedAt: apartment.scrapedAt.toISOString(),
      scrapeHistory: scrapeHistory.map((point) => ({
        bestPoints: point.bestPoints,
        bookers: point.bookers,
        availableUntil: serializeDate(point.availableUntil),
        scrapedAt: point.scrapedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Apartment API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
