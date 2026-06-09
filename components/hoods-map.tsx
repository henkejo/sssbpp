'use client';

import { useState } from 'react';
import Map, { Layer, Popup, Source } from 'react-map-gl/mapbox';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HOODS, type Hood } from '@/lib/hoods';

const HOODS_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: HOODS.map((hood) => ({
    type: 'Feature' as const,
    properties: { name: hood.name },
    geometry: {
      type: 'Point' as const,
      coordinates: [hood.lng, hood.lat] as [number, number],
    },
  })),
};

export function HoodsMap() {
  const [selected, setSelected] = useState<Hood | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
        Set{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          NEXT_PUBLIC_MAPBOX_TOKEN
        </code>{' '}
        in <code className="rounded bg-muted px-1.5 py-0.5 text-sm">.env.local</code>{' '}
        to show the map.
      </div>
    );
  }

  function handleClick(event: MapMouseEvent) {
    const feature = event.features?.[0];
    if (!feature) {
      setSelected(null);
      return;
    }

    const name = feature.properties?.name;
    if (typeof name !== 'string') {
      return;
    }

    const hood = HOODS.find((entry) => entry.name === name);
    if (hood) {
      setSelected(hood);
    }
  }

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-lg border">
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          longitude: 18.06,
          latitude: 59.34,
          zoom: 10.5,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['hoods-circles']}
        onClick={handleClick}
      >
        <Source id="hoods" type="geojson" data={HOODS_GEOJSON}>
          <Layer
            id="hoods-circles"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                9,
                8,
                12,
                14,
                14,
                18,
              ],
              'circle-color': '#2563eb',
              'circle-opacity': 0.8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {selected ? (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => setSelected(null)}
            closeOnClick={false}
            anchor="bottom"
            offset={16}
          >
            <div className="w-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="mb-2 h-32 w-full rounded object-cover"
              />
              <p className="font-semibold">{selected.name}</p>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
