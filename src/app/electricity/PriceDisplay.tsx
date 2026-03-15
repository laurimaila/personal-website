'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getFormattedData, getNowTimestamp, ViewType } from './utils';
import { ChartHeader } from './ChartHeader';
import { PriceChartDisplay } from './AreaChart';
import {
  startOfDay,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import { PriceData } from '@/lib/types';

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  const [useVat, setUseVat] = useState(true);
  const [view, setView] = useState<ViewType>('Day');
  const [hoveredPoint, setHoveredPoint] = useState<PriceData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));

  const formattedData = useMemo(() => {
    return getFormattedData(data, view, useVat, selectedDate);
  }, [data, useVat, view, selectedDate]);

  const nowTimestamp = getNowTimestamp(view);

  const currentPoint = useMemo(() => {
    if (formattedData.length === 0) return null;
    if (nowTimestamp === null) return formattedData[0];

    if (view === 'Day') {
      return formattedData.find((d) => d.timestampKey === nowTimestamp) || formattedData[0];
    }

    return formattedData.findLast((d) => d.timestampKey <= nowTimestamp) || formattedData[0];
  }, [formattedData, nowTimestamp, view]);

  const displayPoint = hoveredPoint || currentPoint;

  const dateRange = useMemo(() => {
    if (data.length === 0) return { min: new Date(), max: new Date() };
    return {
      min: startOfDay(data[0].timestamp),
      max: startOfDay(data[data.length - 1].timestamp),
    };
  }, [data]);

  const getStartOfView = useCallback(
    (date: Date) => {
      if (view === 'Month') return startOfMonth(date);
      if (view === 'Year') return startOfYear(date);
      return startOfDay(date);
    },
    [view],
  );

  const canGoNext = getStartOfView(selectedDate) < getStartOfView(dateRange.max);
  const canGoPrev = getStartOfView(selectedDate) > getStartOfView(dateRange.min);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    const add = view === 'Day' ? addDays : view === 'Month' ? addMonths : addYears;
    setSelectedDate((prev) => add(prev, 1));
  }, [view, canGoNext]);

  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    const sub = view === 'Day' ? subDays : view === 'Month' ? subMonths : subYears;
    setSelectedDate((prev) => sub(prev, 1));
  }, [view, canGoPrev]);

  return (
    <Card className="w-full border-0 shadow-none sm:border sm:shadow-sm">
      <ChartHeader
        displayPoint={displayPoint}
        view={view}
        setView={setView}
        useVat={useVat}
        setUseVat={setUseVat}
        onNext={handleNext}
        onPrev={handlePrev}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        selectedDate={selectedDate}
      />
      <CardContent className="px-0 pt-4 pb-0 sm:px-6 sm:pt-6 sm:pb-2">
        <div className="h-80 w-full sm:h-90">
          <PriceChartDisplay
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
