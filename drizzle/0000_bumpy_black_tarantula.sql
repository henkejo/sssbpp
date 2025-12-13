CREATE TABLE "apartments" (
	"id" text PRIMARY KEY NOT NULL,
	"obj_nr" text NOT NULL,
	"ref_id" text NOT NULL,
	"hood" text NOT NULL,
	"apt_type" text NOT NULL,
	"address" text NOT NULL,
	"apt_nr" text NOT NULL,
	"available_until" timestamp with time zone,
	"best_points" integer DEFAULT 0 NOT NULL,
	"bookers" integer DEFAULT 0 NOT NULL,
	"info_link" text NOT NULL,
	"move_in" timestamp with time zone,
	"rent" integer DEFAULT 0 NOT NULL,
	"sqm" integer DEFAULT 0 NOT NULL,
	"special" text DEFAULT '' NOT NULL,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apartments_ref_id_unique" UNIQUE("ref_id")
);
--> statement-breakpoint
CREATE TABLE "scrapes" (
	"id" text PRIMARY KEY NOT NULL,
	"apartment_ref_id" text NOT NULL,
	"best_points" integer NOT NULL,
	"bookers" integer NOT NULL,
	"available_until" timestamp with time zone,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scrapes" ADD CONSTRAINT "scrapes_apartment_ref_id_apartments_ref_id_fk" FOREIGN KEY ("apartment_ref_id") REFERENCES "public"."apartments"("ref_id") ON DELETE no action ON UPDATE no action;