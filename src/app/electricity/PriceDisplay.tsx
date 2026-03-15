'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  format,
} from 'date-fns';
import { PriceData } from '@/lib/types';

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data: initialData }: PriceChartProps) {
  const [useVat, setUseVat] = useState(true);
  const [view, setView] = useState<ViewType>('Day');
  const [hoveredPoint, setHoveredPoint] = useState<PriceData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [hourlyData, setHourlyData] = useState<PriceData[]>(initialData);
  const [dailyData, setDailyData] = useState<PriceData[]>([]);
  const [monthlyData, setMonthlyData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedAggregates, setLoadedAggregates] = useState({ daily: false, monthly: false });

  const fetchRange = useCallback(async (start: Date, end: Date, type?: 'daily' | 'monthly') => {
    setLoading(true);
    try {
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      const typeParam = type ? `&type=${type}` : '';
      const res = await fetch(
        `/api/electricity/history?start=${startStr}&end=${endStr}${typeParam}`,
      );

      if (!res.ok) throw new Error('Fetching price history failed');
      const history = await res.json();

      if (Array.isArray(history)) {
        const parsed = history.map((d) => ({
          ...d,
          timestamp: new Date(d.timestamp),
          price: d.price !== null ? parseFloat(d.price) : null,
          priceVat: d.priceVat !== null ? parseFloat(d.priceVat) : null,
        }));

        const merge = (prev: PriceData[]) => {
          const combined = [...prev, ...parsed];
          const uniqueMap = new Map<number, PriceData>();
          combined.forEach((d) => uniqueMap.set(d.timestamp.getTime(), d));
          return Array.from(uniqueMap.values()).sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
          );
        };

        if (type === 'daily') {
          setDailyData(merge);
          setLoadedAggregates((prev) => ({ ...prev, daily: true }));
        } else if (type === 'monthly') {
          setMonthlyData(merge);
          setLoadedAggregates((prev) => ({ ...prev, monthly: true }));
        } else {
          setHourlyData(merge);
        }
      }
    } catch (err) {
      if (type === 'daily') setLoadedAggregates((prev) => ({ ...prev, daily: true }));
      if (type === 'monthly') setLoadedAggregates((prev) => ({ ...prev, monthly: true }));
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrev = useCallback(() => {
    const sub = view === 'Day' ? subDays : view === 'Month' ? subMonths : subYears;
    setSelectedDate((prev) => sub(prev, 1));
  }, [view]);

  const handleNext = useCallback(() => {
    const add = view === 'Day' ? addDays : view === 'Month' ? addMonths : addYears;
    setSelectedDate((prev) => add(prev, 1));
  }, [view]);

  // Handle view changes
  const handleSetView = useCallback((newView: ViewType) => {
    const hardLimit = new Date('2025-10-01T00:00:00Z');

    setSelectedDate((prev) => {
      // If switching to Day view, reset to current day
      if (newView === 'Day') return startOfDay(new Date());

      // If we are before the hard limit, snap to it
      if (prev < hardLimit) return startOfDay(hardLimit);

      return prev;
    });

    setView(newView);
  }, []);

  useEffect(() => {
    if (view !== 'Day' || loading || hourlyData.length === 0) return;
    const hardLimit = new Date('2025-10-01T00:00:00Z');
    const minInMemory = hourlyData[0].timestamp;
    if (minInMemory <= hardLimit) return;
    const threshold = addDays(minInMemory, 1);
    if (selectedDate <= threshold) {
      const fetchEnd = subDays(minInMemory, 1);
      const fetchStart = subDays(fetchEnd, 6);
      fetchRange(fetchStart > hardLimit ? fetchStart : hardLimit, fetchEnd);
    }
  }, [selectedDate, hourlyData, view, loading, fetchRange]);

  // Aggregated loading for Month view
  useEffect(() => {
    if (view === 'Month' && !loading && !loadedAggregates.daily) {
      const hardLimit = new Date('2025-10-01T00:00:00Z');
      const yearAgo = subDays(new Date(), 365);
      fetchRange(yearAgo > hardLimit ? yearAgo : hardLimit, new Date(), 'daily');
    }
  }, [view, loading, loadedAggregates.daily, fetchRange]);

  // Aggregated loading for Year view
  useEffect(() => {
    if (view === 'Year' && !loading && !loadedAggregates.monthly) {
      const hardLimit = new Date('2025-10-01T00:00:00Z');
      const yearAgo = subDays(new Date(), 365);
      fetchRange(yearAgo > hardLimit ? yearAgo : hardLimit, new Date(), 'monthly');
    }
  }, [view, loading, loadedAggregates.monthly, fetchRange]);

  const dateRange = useMemo(() => {
    const hardLimit = new Date('2025-10-01T00:00:00Z');
    const dataSet = view === 'Day' ? hourlyData : view === 'Month' ? dailyData : monthlyData;
    if (dataSet.length === 0) return { min: hardLimit, max: new Date() };
    return {
      min: hardLimit,
      max: startOfDay(dataSet[dataSet.length - 1].timestamp),
    };
  }, [hourlyData, dailyData, monthlyData, view]);

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

  const formattedData = useMemo(() => {
    const dataSet = view === 'Day' ? hourlyData : view === 'Month' ? dailyData : monthlyData;
    return getFormattedData(dataSet, view, useVat, selectedDate);
  }, [hourlyData, dailyData, monthlyData, view, useVat, selectedDate]);

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

  return (
    <Card className="w-full border-0 shadow-none sm:border sm:shadow-sm">
      <ChartHeader
        displayPoint={displayPoint}
        view={view}
        setView={handleSetView}
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
