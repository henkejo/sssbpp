'use client';

import Link from 'next/link';
import { Clock, Map } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ViewPage } from '@/components/view-page';

export function HomeView() {
  return (
    <ViewPage
      centered
      title="SSSB++"
      description="Apartment queue ending best points"
      width="narrow"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/latest-closes" className="group block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Clock className="size-6" />
              </div>
              <CardTitle className="text-xl">Latest closes</CardTitle>
              <CardDescription>
                The most recently ended apartments across all areas, sorted by
                close date.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
        <Link href="/map" className="group block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Map className="size-6" />
              </div>
              <CardTitle className="text-xl">Area map</CardTitle>
              <CardDescription>
                A map of all SSSB housing areas in Stockholm with photos.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
      </div>
    </ViewPage>
  );
}
