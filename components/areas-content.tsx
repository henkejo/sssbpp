'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreasTabs, type AreaData } from '@/components/areas-tabs';

type AreasResponse = {
  areas: AreaData[];
  all: AreaData['rows'];
};

export function AreasContent() {
  const [data, setData] = useState<AreasResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/areas?limit=25&allLimit=50')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        return res.json() as Promise<AreasResponse>;
      })
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load areas');
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

  if (data === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (data.areas.length === 0 && data.all.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No ended apartments found yet. Run a scrape to collect data.
        </CardContent>
      </Card>
    );
  }

  return <AreasTabs areas={data.areas} allRows={data.all} />;
}
