import { db } from './index';
import { apartments, scrapes } from './schema';
import { eq } from 'drizzle-orm';
import type { Apartment } from '@/lib/scraper';
import { randomUUID } from 'crypto';

export async function saveApartment(apt: Apartment) {
  const id = randomUUID();
  
  const apartmentData = {
    id,
    objNr: apt.objNr || '',
    refId: apt.refId,
    hood: apt.hood,
    aptType: apt.aptType,
    address: apt.address,
    aptNr: apt.aptNr,
    availableUntil: apt.availableUntil,
    bestPoints: apt.bestPoints,
    bookers: apt.bookers,
    infoLink: apt.infoLink,
    moveIn: apt.moveIn,
    rent: apt.rent,
    sqm: apt.sqm,
    special: apt.special,
  };

  await db
    .insert(apartments)
    .values(apartmentData)
    .onConflictDoUpdate({
      target: apartments.refId,
      set: {
        objNr: apartmentData.objNr,
        hood: apartmentData.hood,
        aptType: apartmentData.aptType,
        address: apartmentData.address,
        aptNr: apartmentData.aptNr,
        availableUntil: apartmentData.availableUntil,
        bestPoints: apartmentData.bestPoints,
        bookers: apartmentData.bookers,
        infoLink: apartmentData.infoLink,
        moveIn: apartmentData.moveIn,
        rent: apartmentData.rent,
        sqm: apartmentData.sqm,
        special: apartmentData.special,
        scrapedAt: new Date(),
      },
    });

  const scrapeId = randomUUID();
  await db.insert(scrapes).values({
    id: scrapeId,
    apartmentRefId: apt.refId,
    bestPoints: apt.bestPoints,
    bookers: apt.bookers,
    availableUntil: apt.availableUntil,
  });
}

export async function saveApartments(apts: Apartment[]) {
  await Promise.all(apts.map(apt => saveApartment(apt)));
}
