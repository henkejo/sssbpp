'use client';

import { useState } from 'react';
import { ApartmentOverview } from '@/components/apartment-overview';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRent } from '@/lib/apartment';
import { t } from '@/lib/i18n';
import type { EndingPointsRow } from '@/lib/db/queries';

export const ALL_TAB = '__all__';

export type AreaData = {
  area: string;
  rows: (Omit<EndingPointsRow, 'availableUntil'> & {
    availableUntil: string;
  })[];
};

type Row = AreaData['rows'][number];

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Stockholm',
});

const numberFormatter = new Intl.NumberFormat('sv-SE');

function AreaTable({
  rows,
  showArea,
  onRowClick,
}: {
  rows: Row[];
  showArea?: boolean;
  onRowClick: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showArea ? <TableHead>Area</TableHead> : null}
          <TableHead>Address</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Rent</TableHead>
          <TableHead className="text-right">Size</TableHead>
          <TableHead className="text-right">Best points</TableHead>
          <TableHead className="text-right">Bookers</TableHead>
          <TableHead className="text-right">Ended</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            className="cursor-pointer"
            onClick={() => onRowClick(row.id)}
          >
            {showArea ? (
              <TableCell className="font-medium">{row.hood}</TableCell>
            ) : null}
            <TableCell>{row.address}</TableCell>
            <TableCell>{t`${row.aptType}`}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatRent(row.rent) ?? '—'}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.sqm > 0 ? `${numberFormatter.format(row.sqm)} m²` : '—'}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {numberFormatter.format(row.bestPoints)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {numberFormatter.format(row.bookers)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {dateFormatter.format(new Date(row.availableUntil))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AreasTabs({
  areas,
  allRows,
}: {
  areas: AreaData[];
  allRows: Row[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);

  function handleRowClick(id: string) {
    setSelectedId(id);
    setOverviewOpen(true);
  }

  function handleOverviewOpenChange(open: boolean) {
    setOverviewOpen(open);
    if (!open) {
      setSelectedId(null);
    }
  }

  return (
    <>
    <Tabs defaultValue={ALL_TAB} className="w-full">
      <TabsList className="!h-auto w-full flex flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger
          value={ALL_TAB}
          className="h-8 w-auto flex-none shrink-0 cursor-pointer px-3 bg-muted hover:bg-muted/80 data-active:bg-background data-active:shadow-sm"
        >
          {t`All`}
        </TabsTrigger>
        {areas.map(({ area }) => (
          <TabsTrigger
            key={area}
            value={area}
            className="h-8 w-auto flex-none shrink-0 cursor-pointer px-3 bg-muted hover:bg-muted/80 data-active:bg-background data-active:shadow-sm"
          >
            {area}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={ALL_TAB} className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle>{t`All`}</CardTitle>
            <CardDescription>
              {allRows.length} most recent ending
              {allRows.length === 1 ? '' : 's'} across all areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaTable rows={allRows} showArea onRowClick={handleRowClick} />
          </CardContent>
        </Card>
      </TabsContent>
      {areas.map(({ area, rows }) => (
        <TabsContent key={area} value={area} className="mt-2">
          <Card>
            <CardHeader>
              <CardTitle>{area}</CardTitle>
              <CardDescription>
                {rows.length} most recent ending{rows.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaTable rows={rows} onRowClick={handleRowClick} />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
    <ApartmentOverview
      id={selectedId}
      open={overviewOpen}
      onOpenChange={handleOverviewOpenChange}
    />
    </>
  );
}
