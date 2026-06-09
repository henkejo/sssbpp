'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatRent } from '@/lib/apartment';
import { t } from '@/lib/i18n';

type ApartmentDetail = {
  hood: string;
  address: string;
  aptType: string;
  aptNr: string;
  level: number | null;
  bestPoints: number;
  bookers: number;
  availableUntil: string | null;
  moveIn: string | null;
  infoLink: string;
  rent: number;
  sqm: number;
  special: string;
  scrapedAt: string;
  scrapeHistory: {
    bestPoints: number;
    bookers: number;
    availableUntil: string | null;
    scrapedAt: string;
  }[];
};

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Stockholm',
});

const numberFormatter = new Intl.NumberFormat('sv-SE');

function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DetailCell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

export function ApartmentOverview({
  id,
  open,
  onOpenChange,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = useState<ApartmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !id) {
      return;
    }

    const activeId = id;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setDetail(null);

      try {
        const response = await fetch(
          `/api/apartments/${encodeURIComponent(activeId)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? 'Failed to load apartment');
        }

        setDetail((await response.json()) as ApartmentDetail);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load apartment',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {detail?.address ?? (loading ? 'Loading…' : 'Apartment')}
          </DialogTitle>
          <DialogDescription>
            {detail
              ? `${detail.hood} · ${t`${detail.aptType}`}`
              : 'Apartment details'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading apartment…</p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard
                label="Rent"
                value={formatRent(detail.rent) ?? '—'}
              />
              <StatCard
                label="Size"
                value={
                  detail.sqm > 0
                    ? `${numberFormatter.format(detail.sqm)} m²`
                    : '—'
                }
              />
              <StatCard
                label="Best points"
                value={numberFormatter.format(detail.bestPoints)}
              />
              <StatCard
                label="Bookers"
                value={numberFormatter.format(detail.bookers)}
              />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <DetailCell label="Area">{detail.hood}</DetailCell>
              <DetailCell label="Type">{t`${detail.aptType}`}</DetailCell>
              <DetailCell label="Level">
                {detail.level !== null ? `Floor ${detail.level}` : '—'}
              </DetailCell>
              <DetailCell label="Apt number">
                {detail.aptNr || '—'}
              </DetailCell>
              <DetailCell label="Ended">
                {detail.availableUntil
                  ? dateFormatter.format(new Date(detail.availableUntil))
                  : '—'}
              </DetailCell>
              <DetailCell label="Move in">
                {detail.moveIn
                  ? dateFormatter.format(new Date(detail.moveIn))
                  : '—'}
              </DetailCell>
            </dl>

            {detail.special ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Special</p>
                <p className="mt-0.5 font-medium">{detail.special}</p>
              </div>
            ) : null}

            <a
              href={detail.infoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Open on SSSB
              <ExternalLink className="size-3.5 shrink-0" />
            </a>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
