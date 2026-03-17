'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { getFormattedData, getNowTimestamp } from './utils';
import { ChartHeader } from './ChartHeader';
import { PricePoint, ViewType, FormattedPoint } from './types';
import { DATE_HARD_LIMIT } from './constants';
import { startOfDay, startOfMonth, startOfYear, addDays } from 'date-fns';

interface ElectricityPriceProps {
  initialData: PricePoint[];
  view: ViewType;
  selectedDate: Date;
}

function getStartOfView(date: Date, view: ViewType): Date {
  if (view === 'Month') return startOfMonth(date);
  if (view === 'Year') return startOfYear(date);
  return startOfDay(date);
}

const PriceChart = dynamic(() => import('./PriceChart').then((m) => m.PriceChart), {
  ssr: false,
});

export function ElectricityPrice({ initialData, view, selectedDate }: ElectricityPriceProps) {
  const [useVat, setUseVat] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<FormattedPoint | null>(null);
  const [now] = useState(() => new Date());

  const canGoNext = useMemo(() => {
    const currentStart = getStartOfView(selectedDate, view);
    if (view === 'Day') return currentStart < startOfDay(addDays(now, 1));
    return currentStart < getStartOfView(now, view);
  }, [selectedDate, now, view]);

  const canGoPrev = useMemo(() => {
    return getStartOfView(selectedDate, view) > getStartOfView(DATE_HARD_LIMIT, view);
  }, [selectedDate, view]);

  const formattedData = useMemo(() => {
    return getFormattedData(initialData, view, useVat, selectedDate);
  }, [initialData, view, useVat, selectedDate]);

  const nowTimestamp = useMemo(() => {
    return getNowTimestamp(view, now);
  }, [view, now]);

  const currentPoint = useMemo(() => {
    if (formattedData.length === 0) return null;
    if (nowTimestamp === null) return formattedData[0];

    if (view === 'Day') {
      return formattedData.find((d) => d.timestampKey === nowTimestamp) || formattedData[0];
    }

    return formattedData.findLast((d) => d.timestampKey <= nowTimestamp) || formattedData[0];
  }, [formattedData, nowTimestamp, view]);

  const displayPoint = hoveredPoint || currentPoint;

  return (
    <Card className="w-full border-0 shadow-none sm:border sm:shadow-sm">
      <ChartHeader
        displayPoint={displayPoint}
        view={view}
        selectedDate={selectedDate}
        useVat={useVat}
        setUseVat={setUseVat}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
      />

      <CardContent className="px-0 pt-4 pb-0 sm:px-6 sm:pt-6 sm:pb-2">
        <div className="relative h-80 w-full sm:h-90">
          <PriceChart
            formattedData={formattedData}
            nowTimestamp={nowTimestamp}
            view={view}
            setActivePoint={setHoveredPoint}
          />
        </div>
      </CardContent>
    </Card>
  );
}
