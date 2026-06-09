'use client';

import { useMemo, useState } from 'react';
import { formatClosesInMonths } from '@/lib/closes';
import { cn } from '@/lib/utils';

type MonthlyPoint = {
  month: number;
  avgClosePoints: number | null;
  closeCount: number;
};

type HoveredPoint = {
  entry: MonthlyPoint & { avgClosePoints: number };
  index: number;
};

const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const numberFormatter = new Intl.NumberFormat('sv-SE');

const CHART_BLUE = '#2563eb';
const CHART_BLUE_LIGHT = '#60a5fa';

function monthLabel(month: number) {
  return monthFormatter.format(new Date(2024, month - 1, 1));
}

export function MonthlyPointsChart({
  data,
  className,
}: {
  data: MonthlyPoint[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);

  const summary = useMemo(() => {
    const totalCloses = data.reduce((sum, entry) => sum + entry.closeCount, 0);
    const monthsWithData = data.filter((entry) => entry.closeCount > 0).length;
    return formatClosesInMonths(totalCloses, monthsWithData);
  }, [data]);

  const chart = useMemo(() => {
    const points = data
      .map((entry, index) => ({ entry, index }))
      .filter(
        (
          item,
        ): item is {
          entry: MonthlyPoint & { avgClosePoints: number };
          index: number;
        } => item.entry.avgClosePoints !== null,
      );

    if (points.length === 0) {
      return null;
    }

    const width = 560;
    const height = 260;
    const padding = { top: 24, right: 20, bottom: 36, left: 52 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const monthCount = Math.max(data.length - 1, 1);
    const baseline = padding.top + plotHeight;

    const values = points.map(({ entry }) => entry.avgClosePoints);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = Math.max(maxValue - minValue, 1);
    const yMin = minValue - valueRange * 0.12;
    const yMax = maxValue + valueRange * 0.12;

    const xForIndex = (index: number) =>
      padding.left + (index / monthCount) * plotWidth;
    const yForValue = (value: number) =>
      padding.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

    const linePath = points
      .map(({ entry, index }, pointIndex) => {
        const command = pointIndex === 0 ? 'M' : 'L';
        return `${command} ${xForIndex(index)} ${yForValue(entry.avgClosePoints)}`;
      })
      .join(' ');

    const yTicks = Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      const value = Math.round(yMin + (yMax - yMin) * (1 - ratio));
      return {
        value,
        y: yForValue(value),
      };
    });

    return {
      width,
      height,
      padding,
      plotWidth,
      plotHeight,
      baseline,
      linePath,
      points,
      yTicks,
      xForIndex,
      yForValue,
    };
  }, [data]);

  if (!chart) {
    return (
      <div className={cn('min-h-0', className)}>
        <p className="mb-2 text-sm text-muted-foreground">{summary}</p>
        <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">
          Not enough data to show seasonality yet.
        </div>
      </div>
    );
  }

  const activePoint = hovered ?? null;

  return (
    <div className={cn('relative min-h-0', className)}>
      <p className="mb-2 text-sm text-muted-foreground">{summary}</p>

      {activePoint ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(chart.xForIndex(activePoint.index) / chart.width) * 100}%`,
            top: `${(chart.yForValue(activePoint.entry.avgClosePoints) / chart.height) * 100}%`,
          }}
        >
          <p className="font-medium text-foreground">
            {monthLabel(activePoint.entry.month)}
          </p>
          <p className="mt-0.5 tabular-nums text-blue-600 dark:text-blue-400">
            ~{numberFormatter.format(activePoint.entry.avgClosePoints)} pts
          </p>
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        className="h-full w-full"
        role="img"
        aria-label="Average closing points by month"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="points-line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CHART_BLUE} />
            <stop offset="100%" stopColor={CHART_BLUE_LIGHT} />
          </linearGradient>
        </defs>

        {chart.yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={chart.padding.left}
              x2={chart.padding.left + chart.plotWidth}
              y1={tick.y}
              y2={tick.y}
              className="stroke-border"
              strokeDasharray="4 5"
            />
            <text
              x={chart.padding.left - 10}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {numberFormatter.format(tick.value)}
            </text>
          </g>
        ))}

        <line
          x1={chart.padding.left}
          x2={chart.padding.left + chart.plotWidth}
          y1={chart.baseline}
          y2={chart.baseline}
          className="stroke-border"
        />

        {data.map((entry, index) => (
          <text
            key={entry.month}
            x={chart.xForIndex(index)}
            y={chart.height - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-medium"
          >
            {monthLabel(entry.month)}
          </text>
        ))}

        <path
          d={chart.linePath}
          fill="none"
          stroke="url(#points-line-gradient)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {chart.points.map(({ entry, index }) => {
          const cx = chart.xForIndex(index);
          const cy = chart.yForValue(entry.avgClosePoints);
          const isActive = activePoint?.index === index;

          return (
            <g key={entry.month}>
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered({ entry, index })}
              />
              {isActive ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill={CHART_BLUE}
                  fillOpacity={0.18}
                  pointerEvents="none"
                />
              ) : null}
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 5.5 : 4}
                fill="white"
                stroke={CHART_BLUE}
                strokeWidth={isActive ? 2.5 : 2}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHovered({ entry, index })}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
