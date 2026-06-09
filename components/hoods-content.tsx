'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HoodsTabs, type HoodData } from '@/components/hoods-tabs';

export function HoodsContent() {
  const [hoods, setHoods] = useState<HoodData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hoods?limit=25')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        return res.json() as Promise<{ hoods: HoodData[] }>;
      })
      .then((data) => setHoods(data.hoods))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load hoods');
      });
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (hoods === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (hoods.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No ended apartments found yet. Run a scrape to collect data.
        </CardContent>
      </Card>
    );
  }

  return <HoodsTabs hoods={hoods} />;
}
