import type { LucideIcon } from 'lucide-react';
import { Cog, GraduationCap, HeartPulse } from 'lucide-react';
import { Marker } from 'react-map-gl/mapbox';
import type { Campus, CampusId } from '@/lib/campuses';

const CAMPUS_ICONS: Record<CampusId, LucideIcon> = {
  kth: Cog,
  ki: HeartPulse,
  su: GraduationCap,
};

const CAMPUS_SHAPES: Record<CampusId, string> = {
  kth: 'rounded-sm',
  ki: 'rounded-full',
  su: 'rounded-lg',
};

const LABEL_ZOOM = 11;
const FULL_NAME_ZOOM = 14.5;

export function CampusMarker({
  campus,
  zoom,
}: {
  campus: Campus;
  zoom: number;
}) {
  const Icon = CAMPUS_ICONS[campus.id];
  const showLabel = zoom >= LABEL_ZOOM;
  const showFullName = zoom >= FULL_NAME_ZOOM;

  return (
    <Marker longitude={campus.lng} latitude={campus.lat} anchor="bottom">
      <div className="pointer-events-none flex flex-col items-center gap-1">
        <div
          className={`flex size-9 items-center justify-center border-2 border-white shadow-md ${CAMPUS_SHAPES[campus.id]}`}
          style={{ backgroundColor: campus.color }}
        >
          <Icon className="size-4 text-white" strokeWidth={2.25} />
        </div>
        {showLabel ? (
          <div className="rounded-md bg-white/95 px-2 py-1 text-center shadow-sm ring-1 ring-black/8">
            <p className="text-[11px] leading-none font-bold tracking-wide">
              {campus.shortName}
            </p>
            {showFullName ? (
              <p className="mt-0.5 max-w-28 text-[9px] leading-tight text-muted-foreground">
                {campus.name}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Marker>
  );
}
