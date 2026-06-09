'use client';

import { usePathname } from 'next/navigation';
import { HomeView } from '@/components/views/home-view';
import { LatestClosesView } from '@/components/views/latest-closes-view';

const views: Record<string, React.ComponentType> = {
  '/': HomeView,
  '/latest-closes': LatestClosesView,
};

export function AppShell() {
  const pathname = usePathname();
  const View = views[pathname] ?? HomeView;

  return <View />;
}
