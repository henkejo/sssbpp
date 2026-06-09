'use client';

import { HoodsMap } from '@/components/hoods-map';
import { ViewPage } from '@/components/view-page';

export function MapView() {
  return (
    <ViewPage
      back
      title="Area map"
      description="All SSSB housing areas in Stockholm. Click a circle to see averages by apartment type."
    >
      <HoodsMap />
    </ViewPage>
  );
}
