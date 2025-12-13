import { pgTable, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const apartments = pgTable('apartments', {
  id: text('id').primaryKey(),
  objNr: text('obj_nr').notNull(),
  refId: text('ref_id').notNull().unique(),
  hood: text('hood').notNull(),
  aptType: text('apt_type').notNull(),
  address: text('address').notNull(),
  aptNr: text('apt_nr').notNull(),
  availableUntil: timestamp('available_until', { withTimezone: true }),
  bestPoints: integer('best_points').notNull().default(0),
  bookers: integer('bookers').notNull().default(0),
  infoLink: text('info_link').notNull(),
  moveIn: timestamp('move_in', { withTimezone: true }),
  rent: integer('rent').notNull().default(0),
  sqm: integer('sqm').notNull().default(0),
  special: text('special').notNull().default(''),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull().defaultNow(),
});

export const scrapes = pgTable('scrapes', {
  id: text('id').primaryKey(),
  apartmentRefId: text('apartment_ref_id').notNull().references(() => apartments.refId),
  bestPoints: integer('best_points').notNull(),
  bookers: integer('bookers').notNull(),
  availableUntil: timestamp('available_until', { withTimezone: true }),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull().defaultNow(),
});
