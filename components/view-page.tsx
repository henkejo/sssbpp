'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type ViewPageProps = {
  title: string;
  description?: string;
  back?: boolean;
  centered?: boolean;
  width?: 'narrow' | 'wide';
  children: React.ReactNode;
};

export function ViewPage({
  title,
  description,
  back = false,
  centered = false,
  width = 'wide',
  children,
}: ViewPageProps) {
  return (
    <main className="min-h-screen p-8">
      <div
        className={
          width === 'narrow'
            ? 'mx-auto max-w-3xl space-y-10'
            : 'mx-auto max-w-6xl space-y-8'
        }
      >
        <div className={centered ? 'text-center' : undefined}>
          {back ? (
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              All views
            </Link>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </main>
  );
}
