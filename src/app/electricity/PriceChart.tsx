'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  Rectangle,
  type BarRectangleItem,
  type BarShapeProps,
} from 'recharts';
import { ViewType, FormattedPoint } from './types';

interface PriceChartDisplayProps {
  formattedData: FormattedPoint[];
  nowTimestamp: number | null;
  view: ViewType;
  setActivePoint: (point: FormattedPoint | null) => void;
}

export const PriceChart = React.memo(function PriceChartDisplay({
  formattedData,
  nowTimestamp,
  view,
  setActivePoint,
}: PriceChartDisplayProps) {
  const router = useRouter();

  const chartData = useMemo(() => {
    if (formattedData.length === 0 || view !== 'Day') return formattedData;
    const lastPoint = formattedData[formattedData.length - 1];
    return [
      ...formattedData,
      { ...lastPoint, timestampKey: lastPoint.timestampKey + 15 * 60 * 1000 },
    ];
  }, [formattedData, view]);

  const handleBarClick = useCallback(
    (data: BarRectangleItem & { timestampKey?: number }) => {
      if (!data?.timestampKey) return;
      const date = new Date(data.timestampKey);
      if (view === 'Year') {
        router.push(`/electricity/month/${format(date, 'yyyy-MM')}`);
      } else if (view === 'Month') {
        router.push(`/electricity/day/${format(date, 'yyyy-MM-dd')}`);
      }
    },
    [view, router],
  );

  const onMouseMove = useCallback(
    (e: { activeTooltipIndex?: number | string | null }) => {
      const idx = e?.activeTooltipIndex;
      const numIdx = typeof idx === 'string' ? parseInt(idx, 10) : idx;
      if (typeof numIdx === 'number' && !isNaN(numIdx)) {
        const index = Math.min(numIdx, formattedData.length - 1);
        const point = formattedData[index];
        if (point) setActivePoint(point);
      }
    },
    [setActivePoint, formattedData],
  );

  const tickFormatter = useCallback(
    (val: number) => {
      if (view === 'Day') return new Date(val).getHours().toString();
      if (view === 'Year') return new Date(val).toLocaleString('default', { month: 'short' });
      return formattedData.find((d) => d.timestampKey === val)?.formattedTime ?? '';
    },
    [formattedData, view],
  );

  // Calculate nice y-axis ticks
  const yTicks = useMemo(() => {
    const prices = formattedData.map((d) => d.displayPrice).filter((p): p is number => p !== null);
    if (prices.length === 0) return [0, 2, 4, 6, 8, 10];

    const dataMax = Math.max(...prices);
    const dataMin = Math.min(...prices);
    const targetMax = Math.max(dataMax * 1.05, 2);
    const targetMin = dataMin < -0.1 ? dataMin * 1.05 : 0;
    const range = targetMax - targetMin;

    const stepThresholds = [
      { maxRange: 2, step: 0.5 },
      { maxRange: 6, step: 1 },
      { maxRange: 10, step: 2 },
      { maxRange: 15, step: 3 },
      { maxRange: 30, step: 5 },
      { maxRange: Infinity, step: 10 },
    ];
    const step = stepThresholds.find(({ maxRange }) => range <= maxRange)!.step;

    const roundedMax = Math.ceil(targetMax / step) * step;
    const roundedMin = Math.floor(targetMin / step) * step;

    const ticks = [];
    for (let i = roundedMin; i <= roundedMax; i += step) ticks.push(i);
    return ticks;
  }, [formattedData]);

  const commonProps = {
    data: chartData,
    onMouseMove,
    onTouchMove: onMouseMove,
    onTouchStart: onMouseMove,
    margin: { top: 10, right: 10, left: 10, bottom: 0 },
  };

  const commonAxes = (
    <>
      <defs>
        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="hsl(var(--border))" />
      <XAxis
        dataKey="timestampKey"
        type="number"
        scale="time"
        domain={['dataMin', 'dataMax']}
        padding={
          view === 'Day'
            ? { left: 5, right: 5 }
            : view === 'Month'
              ? { left: 20, right: 20 }
              : { left: 40, right: 40 }
        }
        axisLine={false}
        tickLine={false}
        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        tickMargin={10}
        tickFormatter={tickFormatter}
        interval={view === 'Day' ? 7 : view === 'Month' ? 1 : 0}
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
        cursor={
          view === 'Day'
            ? { stroke: 'hsl(var(--primary-foreground) / 0.8)', strokeWidth: 2 }
            : { fill: 'hsl(var(--primary-foreground) / 0.2)' }
        }
        content={() => null}
        isAnimationActive={true}
        animationDuration={300}
        wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}
      />
      {nowTimestamp && view === 'Day' && (
        <ReferenceLine
          x={nowTimestamp}
          stroke="hsl(var(--tertiary) / 0.8)"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      )}
    </>
  );

  return (
    <div
      className="h-full w-full min-w-0 outline-none select-none"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        outline: 'none',
      }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
        debounce={1}
        className="outline-none">
        {view === 'Day' ? (
          <AreaChart accessibilityLayer={false} tabIndex={-1} {...commonProps}>
            {commonAxes}
            <Area
              type="stepAfter"
              dataKey="displayPrice"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={true}
              animationDuration={300}
              dot={false}
              connectNulls={true}
              activeDot={{
                fill: 'hsl(var(--primary-foreground) / 0.7)',
                strokeWidth: 0,
                r: 4,
              }}
            />
          </AreaChart>
        ) : (
          <BarChart accessibilityLayer={false} tabIndex={-1} {...commonProps}>
            {commonAxes}
            <Bar
              dataKey="displayPrice"
              radius={[1, 1, 0, 0]}
              isAnimationActive={true}
              animationDuration={300}
              shape={(props: BarShapeProps & { timestampKey?: number }) => (
                <g onClick={() => handleBarClick(props)}>
                  <Rectangle
                    {...props}
                    fill={
                      props.timestampKey === nowTimestamp
                        ? 'hsl(var(--tertiary) / 0.7)'
                        : 'hsl(var(--primary) / 0.7)'
                    }
                    radius={[1, 1, 0, 0]}
                  />
                  <rect
                    x={(props.background as { x?: number })?.x}
                    y={(props.background as { y?: number })?.y}
                    width={(props.background as { width?: number })?.width}
                    height={(props.background as { height?: number })?.height}
                    fill="transparent"
                  />
                </g>
              )}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});
