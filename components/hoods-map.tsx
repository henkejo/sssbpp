'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Map, { Layer, Source, type MapRef } from 'react-map-gl/mapbox';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CampusMarker } from '@/components/campus-marker';
import { CAMPUSES } from '@/lib/campuses';
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

function fitMapToPoints(map: mapboxgl.Map) {
  const bounds = new mapboxgl.LngLatBounds();

  for (const hood of HOODS) {
    bounds.extend([hood.lng, hood.lat]);
  }
  for (const campus of CAMPUSES) {
    bounds.extend([campus.lng, campus.lat]);
  }

  if (bounds.isEmpty()) return;

  map.fitBounds(bounds, { padding: 72, maxZoom: 12, duration: 0 });
}

export function HoodsMap() {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<Hood | null>(null);
  const [cursor, setCursor] = useState<string>('grab');
  const [zoom, setZoom] = useState(10);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const selectedGeojson = useMemo(() => {
    if (!selected) return null;

    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'Point' as const,
            coordinates: [selected.lng, selected.lat] as [number, number],
          },
        },
      ],
    };
  }, [selected]);

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      fitMapToPoints(map);
      setZoom(map.getZoom());
    }
  }, []);

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

  function handleMouseMove(event: MapMouseEvent) {
    setCursor(event.features?.length ? 'pointer' : 'grab');
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

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelected(null);
    }
  }

  return (
    <>
      <div className="h-[70vh] w-full overflow-hidden rounded-lg border">
        <Map
          ref={mapRef}
          mapboxAccessToken={token}
          initialViewState={{
            longitude: 18.06,
            latitude: 59.34,
            zoom: 10,
          }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: '100%', height: '100%' }}
          interactiveLayerIds={['hoods-circles', 'hoods-glow']}
          cursor={cursor}
          onLoad={handleLoad}
          onMove={(event) => setZoom(event.viewState.zoom)}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          <Source id="hoods" type="geojson" data={HOODS_GEOJSON}>
            <Layer
              id="hoods-glow"
              type="circle"
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  8,
                  14,
                  10,
                  20,
                  12,
                  26,
                  14,
                  32,
                ],
                'circle-color': '#94a3b8',
                'circle-opacity': 0.22,
                'circle-blur': 0.85,
              }}
            />
            <Layer
              id="hoods-circles"
              type="circle"
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  8,
                  6,
                  10,
                  10,
                  12,
                  14,
                  14,
                  18,
                ],
                'circle-color': '#334155',
                'circle-opacity': 0.92,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-stroke-opacity': 0.95,
              }}
            />
          </Source>

          {selectedGeojson ? (
            <Source id="hood-selected" type="geojson" data={selectedGeojson}>
              <Layer
                id="hood-selected-glow"
                type="circle"
                paint={{
                  'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    8,
                    18,
                    10,
                    26,
                    12,
                    34,
                    14,
                    42,
                  ],
                  'circle-color': '#1e293b',
                  'circle-opacity': 0.35,
                  'circle-blur': 0.85,
                }}
              />
              <Layer
                id="hood-selected-circle"
                type="circle"
                paint={{
                  'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    8,
                    8,
                    10,
                    12,
                    12,
                    16,
                    14,
                    20,
                  ],
                  'circle-color': '#0f172a',
                  'circle-opacity': 0.95,
                  'circle-stroke-width': 3,
                  'circle-stroke-color': '#ffffff',
                  'circle-stroke-opacity': 1,
                }}
              />
            </Source>
          ) : null}

          {CAMPUSES.map((campus) => (
            <CampusMarker key={campus.id} campus={campus} zoom={zoom} />
          ))}
        </Map>
      </div>

      <Dialog open={selected !== null} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          {selected ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="aspect-[16/10] w-full object-cover"
              />
              <DialogHeader className="p-4 pt-3">
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
