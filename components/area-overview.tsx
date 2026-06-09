'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MonthlyPointsChart } from '@/components/monthly-points-chart';
import { formatRent } from '@/lib/apartment';
import { formatCloseCount } from '@/lib/closes';
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

type MonthlyClosingPoints = {
  month: number;
  avgClosePoints: number | null;
  closeCount: number;
};

type AptTypeDetail = {
  name: string;
  aptType: string;
  imageUrl: string;
  monthlyPoints: MonthlyClosingPoints[];
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
  const [selectedAptType, setSelectedAptType] = useState<string | null>(null);
  const [aptTypeDetail, setAptTypeDetail] = useState<AptTypeDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

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
      setSelectedAptType(null);
      setAptTypeDetail(null);
      setDetailError(null);

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

  useEffect(() => {
    if (!open || !hood || !selectedAptType) {
      return;
    }

    const activeHood = hood;
    const activeAptType = selectedAptType;
    const controller = new AbortController();

    async function load() {
      setDetailLoading(true);
      setDetailError(null);
      setAptTypeDetail(null);

      try {
        const response = await fetch(
          `/api/areas/${encodeURIComponent(activeHood.name)}/types/${encodeURIComponent(activeAptType)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? 'Failed to load apartment type');
        }

        setAptTypeDetail((await response.json()) as AptTypeDetail);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }
        setDetailError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load apartment type',
        );
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [open, hood, selectedAptType]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedAptType(null);
      setAptTypeDetail(null);
      setDetailError(null);
    }
    onOpenChange(nextOpen);
  };

  const imageUrl = selectedAptType
    ? (aptTypeDetail?.imageUrl ?? stats?.imageUrl ?? hood?.imageUrl)
    : (stats?.imageUrl ?? hood?.imageUrl);
  const title = selectedAptType
    ? (aptTypeDetail?.aptType ?? selectedAptType)
    : (stats?.name ?? hood?.name);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="aspect-video h-auto w-[85vw] max-w-[85vw] gap-0 overflow-hidden p-0 sm:max-w-[85vw]">
        {selectedAptType ? (
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedAptType(null);
                      setAptTypeDetail(null);
                      setDetailError(null);
                    }}
                    aria-label="Back to apartment types"
                  >
                    <ArrowLeft />
                  </Button>
                  <DialogTitle className="truncate">
                    {t`${title ?? (detailLoading ? 'Loading…' : 'Apartment type')}`}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Average closing points by month
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 p-4 pt-3">
                {detailLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading seasonality…
                  </p>
                ) : null}

                {detailError ? (
                  <p className="text-sm text-destructive">{detailError}</p>
                ) : null}

                {aptTypeDetail && !detailLoading ? (
                  <MonthlyPointsChart
                    data={aptTypeDetail.monthlyPoints}
                    className="h-full min-h-48"
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : (
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
                <DialogTitle>
                  {title ?? (loading ? 'Loading…' : 'Area')}
                </DialogTitle>
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
                        <button
                          key={entry.aptType}
                          type="button"
                          onClick={() => setSelectedAptType(entry.aptType)}
                          className="w-full cursor-pointer rounded-lg border bg-muted/40 px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <p className="truncate text-sm font-medium">
                            {t`${entry.aptType}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCloseCount(entry.closeCount)}
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
                        </button>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
