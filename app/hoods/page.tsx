import { HoodsContent } from '@/components/hoods-content';

export default function HoodsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ending best points by area
          </h1>
          <p className="mt-1 text-muted-foreground">
            The 25 most recently ended apartments per area, with their final best
            points.
          </p>
        </div>

        <HoodsContent />
      </div>
    </main>
  );
}
