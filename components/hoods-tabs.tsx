'use client';

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
import type { EndingPointsRow } from '@/lib/db/queries';

export type HoodData = {
  hood: string;
  rows: (Omit<EndingPointsRow, 'availableUntil'> & {
    availableUntil: string;
  })[];
};

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Stockholm',
});

const numberFormatter = new Intl.NumberFormat('sv-SE');

function HoodTable({ rows }: { rows: HoodData['rows'] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Best points</TableHead>
          <TableHead className="text-right">Bookers</TableHead>
          <TableHead className="text-right">Ended</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.refId}>
            <TableCell>{row.address}</TableCell>
            <TableCell>{row.aptType}</TableCell>
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

export function HoodsTabs({ hoods }: { hoods: HoodData[] }) {
  const defaultHood = hoods[0]?.hood;

  return (
    <Tabs defaultValue={defaultHood} className="w-full">
      <TabsList className="!h-auto w-full flex flex-wrap justify-start gap-2 bg-transparent p-0">
        {hoods.map(({ hood }) => (
          <TabsTrigger
            key={hood}
            value={hood}
            className="h-8 w-auto flex-none shrink-0 cursor-pointer px-3 bg-muted hover:bg-muted/80 data-active:bg-background data-active:shadow-sm"
          >
            {hood}
          </TabsTrigger>
        ))}
      </TabsList>
      {hoods.map(({ hood, rows }) => (
        <TabsContent key={hood} value={hood} className="mt-2">
          <Card>
            <CardHeader>
              <CardTitle>{hood}</CardTitle>
              <CardDescription>
                {rows.length} most recent ending{rows.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HoodTable rows={rows} />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
