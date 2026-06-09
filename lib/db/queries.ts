import { sql } from 'drizzle-orm';
import { db } from './index';

export type EndingPointsRow = {
  hood: string;
  address: string;
  aptType: string;
  bestPoints: number;
  bookers: number;
  availableUntil: Date;
  refId: string;
};

type EndingPointsDbRow = {
  hood: string;
  address: string;
  apt_type: string;
  best_points: number;
  bookers: number;
  available_until: string;
  ref_id: string;
};

export async function getEndingPointsByHood(
  limitPerHood = 25,
): Promise<{ hood: string; rows: EndingPointsRow[] }[]> {
  const result = await db.execute<EndingPointsDbRow>(sql`
    WITH latest_scrape AS (
      SELECT DISTINCT ON (s.apartment_ref_id)
        s.apartment_ref_id,
        s.best_points,
        s.bookers,
        s.available_until
      FROM scrapes s
      WHERE s.available_until IS NOT NULL
        AND s.available_until < NOW()
      ORDER BY s.apartment_ref_id, s.scraped_at DESC
    ),
    ranked AS (
      SELECT
        a.hood,
        a.address,
        a.apt_type,
        a.ref_id,
        ls.best_points,
        ls.bookers,
        ls.available_until,
        ROW_NUMBER() OVER (PARTITION BY a.hood ORDER BY ls.available_until DESC) AS rn
      FROM latest_scrape ls
      JOIN apartments a ON ls.apartment_ref_id = a.ref_id
    )
    SELECT hood, address, apt_type, ref_id, best_points, bookers, available_until
    FROM ranked
    WHERE rn <= ${limitPerHood}
    ORDER BY hood, available_until DESC
  `);

  const byHood = new Map<string, EndingPointsRow[]>();

  for (const row of result) {
    const entry: EndingPointsRow = {
      hood: row.hood,
      address: row.address,
      aptType: row.apt_type,
      bestPoints: row.best_points,
      bookers: row.bookers,
      availableUntil: new Date(row.available_until),
      refId: row.ref_id,
    };
    const list = byHood.get(row.hood) ?? [];
    list.push(entry);
    byHood.set(row.hood, list);
  }

  return [...byHood.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'sv'))
    .map(([hood, rows]) => ({ hood, rows }));
}
