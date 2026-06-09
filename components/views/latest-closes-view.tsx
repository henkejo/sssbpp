'use client';

import { AreasContent } from '@/components/areas-content';
import { ViewPage } from '@/components/view-page';

export function LatestClosesView() {
  return (
    <ViewPage
      back
      title="Latest closes"
      description="The most recently ended apartments across all areas, with their final best points."
    >
      <AreasContent />
    </ViewPage>
  );
}
