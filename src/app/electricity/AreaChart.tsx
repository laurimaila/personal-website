'use client';

import React, { useCallback, useMemo } from 'react';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { ViewType } from './utils';

interface PriceDataPoint {
  timestampKey: number;
  formattedTime: string;
  displayPrice: number | null;
}

interface PriceChartDisplayProps {
  formattedData: PriceDataPoint[];
  nowTimestamp: number | null;
  view: ViewType;
  setActivePoint: (point: any) => void;
}

export const PriceChartDisplay = React.memo(
  function PriceChartDisplay({
    formattedData,
    nowTimestamp,
    view,
    setActivePoint,
  }: PriceChartDisplayProps) {
    const dataMap = useMemo(
      () => new Map(formattedData.map((d) => [d.timestampKey, d])),
      [formattedData],
    );

    // Calculate the interval duration in ms to find the middle
    const intervalMs = useMemo(() => {
      if (view === 'Day') return 15 * 60 * 1000;
      if (view === 'Month') return 24 * 60 * 60 * 1000;
      if (view === 'Year') return 30 * 24 * 60 * 60 * 1000; // Approx month
      return 0;
    }, [view]);

    // Shift data points to the middle for visual centering of the cursor
    const centeredData = useMemo(() => {
      return formattedData.map((d) => ({
        ...d,
        visualTimestamp: d.timestampKey + intervalMs / 2,
      }));
    }, [formattedData, intervalMs]);

    const onMouseMove = useCallback(
      function handleMouseMove(e: any) {
        if (e && e.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null) {
          const point = centeredData[e.activeTooltipIndex];
          if (point) {
            setActivePoint(point);
          }
        }
      },
      [setActivePoint, centeredData],
    );

    const onMouseLeave = useCallback(
      function handleMouseLeave() {
        setActivePoint(null);
      },
      [setActivePoint],
    );

    const tickFormatter = useCallback(
      (val: any) => {
        // Subtract the offset to show the original interval start time on axis
        const originalTs = val - intervalMs / 2;
        const point = dataMap.get(originalTs);
        if (!point) return '';

        if (view === 'Day') {
          return new Date(originalTs).getHours().toString();
        }

        return point.formattedTime ?? '';
      },
      [dataMap, intervalMs, view],
    );

    // Calculate y-axis ticks to make the chart nice
    const yTicks = useMemo(() => {
      const prices =
        (formattedData.map((d) => d.displayPrice).filter((p) => p !== null) as number[]) || [];
      if (prices.length === 0) return [0, 2, 4, 6, 8, 10];

      const dataMax = Math.max(...prices);
      const dataMin = Math.min(...prices);

      const targetMax = Math.max(10, dataMax);
      const targetMin = Math.min(0, dataMin);

      // Sensible step size
      let step = 2;
      const range = targetMax - targetMin;
      if (range > 60) step = 20;
      else if (range > 30) step = 10;
      else if (range > 10) step = 5;

      const roundedMax = Math.ceil(targetMax / step) * step;
      const roundedMin = Math.floor(targetMin / step) * step;

      const ticks = [];
      for (let i = roundedMin; i <= roundedMax; i += step) {
        ticks.push(i);
      }
      return ticks;
    }, [formattedData]);

    return (
      <div
        className="h-full w-full min-w-0 outline-none select-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          outline: 'none',
        }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minHeight={0}
          debounce={1}
          className="outline-none">
          <AreaChart
            accessibilityLayer={false}
            tabIndex={-1}
            data={centeredData}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onTouchMove={onMouseMove}
            onTouchStart={onMouseMove}
            onTouchEnd={onMouseLeave}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            className="outline-none select-none">
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="visualTimestamp"
              type="number"
              scale="time"
              domain={['dataMin - ' + intervalMs / 2, 'dataMax + ' + intervalMs / 2]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickMargin={10}
              tickFormatter={tickFormatter}
              interval={view === 'Day' ? 7 : 0}
            />
            <YAxis
              width={45}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
              domain={[yTicks[0], yTicks[yTicks.length - 1]]}
              ticks={yTicks}
              label={{
                value: 'c/kWh',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fill: 'hsl(var(--muted-foreground))', fontSize: 13 },
              }}
            />
            <Tooltip
              cursor={{
                stroke: 'hsl(var(--tertiary))',
                strokeWidth: 2,
              }}
              content={() => null}
              isAnimationActive={true}
              animationDuration={300}
              wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}
            />
            {nowTimestamp && view === 'Day' && (
              <ReferenceLine
                x={nowTimestamp + intervalMs / 2}
                stroke="hsl(var(--primary-foreground) / 0.5)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
            <Area
              type="step"
              dataKey="displayPrice"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={true}
              animationDuration={250}
              dot={false}
              connectNulls={false}
              activeDot={{
                fill: 'hsl(var(--tertiary))',
                strokeWidth: 0,
                r: 4,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.formattedData === next.formattedData &&
      prev.nowTimestamp === next.nowTimestamp &&
      prev.view === next.view
    );
  },
);
