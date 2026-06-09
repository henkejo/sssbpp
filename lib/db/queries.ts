import { sql } from 'drizzle-orm';
import { db } from './index';

export type EndingPointsRow = {
  id: string;
  hood: string;
  address: string;
  aptType: string;
  bestPoints: number;
  bookers: number;
  availableUntil: Date;
  refId: string;
  rent: number;
  sqm: number;
};

type EndingPointsDbRow = {
  id: string;
  hood: string;
  address: string;
  apt_type: string;
  best_points: number;
  bookers: number;
  available_until: string;
  ref_id: string;
  rent: number;
  sqm: number;
};

export type ApartmentDetail = {
  refId: string;
  objNr: string;
  hood: string;
  address: string;
  aptType: string;
  aptNr: string;
  bestPoints: number;
  bookers: number;
  availableUntil: Date | null;
  moveIn: Date | null;
  infoLink: string;
  rent: number;
  sqm: number;
  special: string;
  scrapedAt: Date;
};

export type ScrapeHistoryPoint = {
  bestPoints: number;
  bookers: number;
  availableUntil: Date | null;
  scrapedAt: Date;
};

type ApartmentDetailDbRow = {
  obj_nr: string;
  ref_id: string;
  hood: string;
  address: string;
  apt_type: string;
  apt_nr: string;
  best_points: number;
  bookers: number;
  available_until: string | null;
  move_in: string | null;
  info_link: string;
  rent: number;
  sqm: number;
  special: string;
  scraped_at: string;
};

type ScrapeHistoryDbRow = {
  best_points: number;
  bookers: number;
  available_until: string | null;
  scraped_at: string;
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
        a.id,
        a.hood,
        a.address,
        a.apt_type,
        a.ref_id,
        a.rent,
        a.sqm,
        ls.best_points,
        ls.bookers,
        ls.available_until,
        ROW_NUMBER() OVER (PARTITION BY a.hood ORDER BY ls.available_until DESC) AS rn
      FROM latest_scrape ls
      JOIN apartments a ON ls.apartment_ref_id = a.ref_id
    )
    SELECT id, hood, address, apt_type, ref_id, rent, sqm, best_points, bookers, available_until
    FROM ranked
    WHERE rn <= ${limitPerHood}
    ORDER BY hood, available_until DESC
  `);

  const byHood = new Map<string, EndingPointsRow[]>();

  for (const row of result) {
    const entry: EndingPointsRow = {
      id: row.id,
      hood: row.hood,
      address: row.address,
      aptType: row.apt_type,
      bestPoints: row.best_points,
      bookers: row.bookers,
      availableUntil: new Date(row.available_until),
      refId: row.ref_id,
      rent: row.rent,
      sqm: row.sqm,
    };
    const list = byHood.get(row.hood) ?? [];
    list.push(entry);
    byHood.set(row.hood, list);
  }

  return [...byHood.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'sv'))
    .map(([hood, rows]) => ({ hood, rows }));
}

export async function getLatestCloses(limit = 50): Promise<EndingPointsRow[]> {
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
    )
    SELECT
      a.id,
      a.hood,
      a.address,
      a.apt_type,
      a.ref_id,
      a.rent,
      a.sqm,
      ls.best_points,
      ls.bookers,
      ls.available_until
    FROM latest_scrape ls
    JOIN apartments a ON ls.apartment_ref_id = a.ref_id
    ORDER BY ls.available_until DESC
    LIMIT ${limit}
  `);

  return result.map((row) => ({
    id: row.id,
    hood: row.hood,
    address: row.address,
    aptType: row.apt_type,
    bestPoints: row.best_points,
    bookers: row.bookers,
    availableUntil: new Date(row.available_until),
    refId: row.ref_id,
    rent: row.rent,
    sqm: row.sqm,
  }));
}

async function fetchApartmentDetail(
  whereClause: ReturnType<typeof sql>,
): Promise<ApartmentDetail | null> {
  const result = await db.execute<ApartmentDetailDbRow>(sql`
    WITH latest_scrape AS (
      SELECT DISTINCT ON (s.apartment_ref_id)
        s.apartment_ref_id,
        s.best_points,
        s.bookers,
        s.available_until
      FROM scrapes s
      ORDER BY s.apartment_ref_id, s.scraped_at DESC
    )
    SELECT
      a.obj_nr,
      a.ref_id,
      a.hood,
      a.address,
      a.apt_type,
      a.apt_nr,
      COALESCE(ls.best_points, a.best_points) AS best_points,
      COALESCE(ls.bookers, a.bookers) AS bookers,
      COALESCE(ls.available_until, a.available_until) AS available_until,
      a.move_in,
      a.info_link,
      a.rent,
      a.sqm,
      a.special,
      a.scraped_at
    FROM apartments a
    LEFT JOIN latest_scrape ls ON ls.apartment_ref_id = a.ref_id
    WHERE ${whereClause}
    LIMIT 1
  `);

  const row = result[0];
  if (!row) {
    return null;
  }

  return {
    refId: row.ref_id,
    objNr: row.obj_nr,
    hood: row.hood,
    address: row.address,
    aptType: row.apt_type,
    aptNr: row.apt_nr,
    bestPoints: row.best_points,
    bookers: row.bookers,
    availableUntil: row.available_until
      ? new Date(row.available_until)
      : null,
    moveIn: row.move_in ? new Date(row.move_in) : null,
    infoLink: row.info_link,
    rent: row.rent,
    sqm: row.sqm,
    special: row.special,
    scrapedAt: new Date(row.scraped_at),
  };
}

export async function getApartmentById(
  id: string,
): Promise<ApartmentDetail | null> {
  return fetchApartmentDetail(sql`a.id = ${id}`);
}

export async function getApartmentByRefId(
  refId: string,
): Promise<ApartmentDetail | null> {
  return fetchApartmentDetail(sql`a.ref_id = ${refId}`);
}

export type AptTypeClosingStats = {
  aptType: string;
  closeCount: number;
  avgClosePoints: number;
  avgRent: number;
  avgSqm: number;
};

type AptTypeClosingStatsDbRow = {
  apt_type: string;
  close_count: number;
  avg_close_points: string;
  avg_rent: string | null;
  avg_sqm: string | null;
};

export async function getAverageClosingPointsByHood(
  hoodNames: string[],
): Promise<AptTypeClosingStats[]> {
  if (hoodNames.length === 0) {
    return [];
  }

  const result = await db.execute<AptTypeClosingStatsDbRow>(sql`
    WITH latest_scrape AS (
      SELECT DISTINCT ON (s.apartment_ref_id)
        s.apartment_ref_id,
        s.best_points,
        s.available_until
      FROM scrapes s
      WHERE s.available_until IS NOT NULL
        AND s.available_until < NOW()
      ORDER BY s.apartment_ref_id, s.scraped_at DESC
    )
    SELECT
      a.apt_type,
      COUNT(*)::int AS close_count,
      AVG(ls.best_points) AS avg_close_points,
      AVG(a.rent) FILTER (WHERE a.rent > 0) AS avg_rent,
      AVG(a.sqm) FILTER (WHERE a.sqm > 0) AS avg_sqm
    FROM latest_scrape ls
    JOIN apartments a ON ls.apartment_ref_id = a.ref_id
    WHERE a.hood IN (${sql.join(
      hoodNames.map((name) => sql`${name}`),
      sql`, `,
    )})
    GROUP BY a.apt_type
    ORDER BY AVG(a.rent) FILTER (WHERE a.rent > 0) ASC NULLS LAST
  `);

  return result.map((row) => ({
    aptType: row.apt_type,
    closeCount: row.close_count,
    avgClosePoints: Math.round(Number(row.avg_close_points)),
    avgRent: row.avg_rent ? Math.round(Number(row.avg_rent)) : 0,
    avgSqm: row.avg_sqm ? Math.round(Number(row.avg_sqm)) : 0,
  }));
}

export async function getApartmentScrapeHistory(
  refId: string,
): Promise<ScrapeHistoryPoint[]> {
  const result = await db.execute<ScrapeHistoryDbRow>(sql`
    SELECT best_points, bookers, available_until, scraped_at
    FROM scrapes
    WHERE apartment_ref_id = ${refId}
    ORDER BY scraped_at ASC
  `);

  return result.map((row) => ({
    bestPoints: row.best_points,
    bookers: row.bookers,
    availableUntil: row.available_until
      ? new Date(row.available_until)
      : null,
    scrapedAt: new Date(row.scraped_at),
  }));
}
