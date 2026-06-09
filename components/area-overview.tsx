'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatRent } from '@/lib/apartment';
import { t } from '@/lib/i18n';
import type { Hood } from '@/lib/hoods';

type AptTypeClosingStats = {
  aptType: string;
  closeCount: number;
  avgClosePoints: number;
  avgRent: number;
  avgSqm: number;
};

type AreaStats = {
  name: string;
  imageUrl: string;
  aptTypes: AptTypeClosingStats[];
};

const numberFormatter = new Intl.NumberFormat('sv-SE');

export function AreaOverview({
  hood,
  open,
  onOpenChange,
}: {
  hood: Hood | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [stats, setStats] = useState<AreaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !hood) {
      return;
    }

    const activeHood = hood;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setStats(null);

      try {
        const response = await fetch(
          `/api/areas/${encodeURIComponent(activeHood.name)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? 'Failed to load area');
        }

        setStats((await response.json()) as AreaStats);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load area',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [open, hood]);

  const imageUrl = stats?.imageUrl ?? hood?.imageUrl;
  const title = stats?.name ?? hood?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="aspect-video h-auto w-[85vw] max-w-[85vw] gap-0 overflow-hidden p-0 sm:max-w-[85vw]">
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title ?? 'Area'}
              className="h-full min-h-0 w-full object-cover"
            />
          ) : (
            <div className="h-full min-h-0 bg-muted" />
          )}

          <div className="flex min-h-0 flex-col">
            <DialogHeader className="shrink-0 gap-1 p-4 pb-0">
              <DialogTitle>{title ?? (loading ? 'Loading…' : 'Area')}</DialogTitle>
              <DialogDescription>
                Averages by apartment type
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading area…</p>
              ) : null}

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              {stats && !loading ? (
                stats.aptTypes.length > 0 ? (
                  <div className="space-y-2">
                    {stats.aptTypes.map((entry) => (
                      <div
                        key={entry.aptType}
                        className="rounded-lg border bg-muted/40 px-3 py-2.5"
                      >
                        <p className="truncate text-sm font-medium">
                          {t`${entry.aptType}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {numberFormatter.format(entry.closeCount)} close
                          {entry.closeCount === 1 ? '' : 's'}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Average points
                            </p>
                            <p className="font-semibold tabular-nums">
                              ~{numberFormatter.format(entry.avgClosePoints)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Average rent
                            </p>
                            <p className="font-semibold tabular-nums">
                              {formatRent(entry.avgRent)
                                ? `~${formatRent(entry.avgRent)}`
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Average size
                            </p>
                            <p className="font-semibold tabular-nums">
                              {entry.avgSqm > 0
                                ? `~${numberFormatter.format(entry.avgSqm)} m²`
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No closed apartments recorded for this area yet.
                  </p>
                )
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
