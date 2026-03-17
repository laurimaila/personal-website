'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ViewType, FormattedPoint } from './types';
import { DATE_HARD_LIMIT } from './constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  max,
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  startOfYear,
} from 'date-fns';

interface ChartNavigationProps {
  selectedDate: Date;
  view: ViewType;
  canGoNext?: boolean;
  canGoPrev?: boolean;
}

function getUrl(view: ViewType, date: Date) {
  const viewParam = view.toLowerCase();
  let dateStr = format(date, 'yyyy-MM-dd');
  if (viewParam === 'month') dateStr = format(date, 'yyyy-MM');
  if (viewParam === 'year') dateStr = format(date, 'yyyy');
  return `/electricity/${viewParam}/${dateStr}`;
}

const ChartNavigation = React.memo(function ChartNavigation({
  selectedDate,
  view,
  canGoNext,
  canGoPrev,
}: ChartNavigationProps) {
  const dateLabel = useMemo(() => {
    if (view === 'Day') {
      const dateStr = format(selectedDate, 'd.M.');
      if (isToday(selectedDate)) return `Today ${dateStr}`;
      if (isTomorrow(selectedDate)) return `Tomorrow ${dateStr}`;
      if (isYesterday(selectedDate)) return `Yesterday ${dateStr}`;
      return dateStr;
    }
    if (view === 'Month') {
      return format(selectedDate, 'MMMM yyyy');
    }
    if (view === 'Year') {
      return format(selectedDate, 'yyyy');
    }
    return '';
  }, [selectedDate, view]);

  const sub = view === 'Day' ? subDays : view === 'Month' ? subMonths : subYears;
  const add = view === 'Day' ? addDays : view === 'Month' ? addMonths : addYears;
  const prevDate = sub(selectedDate, 1);
  const nextDate = add(selectedDate, 1);

  return (
    <div className="flex items-center gap-1 rounded-md border p-1">
      {canGoPrev ? (
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={getUrl(view, prevDate)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-not-allowed opacity-50"
          disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <span className="min-w-24 px-1 text-center text-xs font-medium capitalize tabular-nums">
        {dateLabel}
      </span>

      {canGoNext ? (
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={getUrl(view, nextDate)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-not-allowed opacity-50"
          disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

interface PriceDisplayProps {
  displayPoint: FormattedPoint | null;
}

const PriceDisplay = React.memo(function PriceDisplay({ displayPoint }: PriceDisplayProps) {
  const unit = 'c/kWh';

  const subLabel = displayPoint?.interval ?? displayPoint?.fullDate ?? '—';

  const hasPrice = typeof displayPoint?.displayPrice === 'number';

  return (
    <div className="flex min-h-12 flex-col justify-center">
      <CardTitle className="flex items-baseline gap-2 leading-none">
        <span className="text-primary text-2xl font-black tabular-nums">
          {hasPrice ? displayPoint.displayPrice?.toFixed(2) : '—'}
          {hasPrice && (
            <span className="text-muted-foreground ml-1 text-sm font-normal">{unit}</span>
          )}
        </span>
      </CardTitle>
      <CardDescription className="min-h-5 text-[13px] tracking-wider">{subLabel}</CardDescription>
    </div>
  );
});

interface ChartControlsProps {
  view: ViewType;
  selectedDate: Date;
  useVat: boolean;
  setUseVat: (useVat: boolean) => void;
}

const ChartControls = React.memo(function ChartControls({
  view,
  selectedDate,
  useVat,
  setUseVat,
}: ChartControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-8 sm:py-4">
      <div className="flex gap-1 rounded-md border p-1">
        {(['Day', 'Month', 'Year'] as ViewType[]).map((v) => {
          let targetDate = selectedDate;
          if (v === 'Month')
            targetDate = max([startOfMonth(selectedDate), startOfMonth(DATE_HARD_LIMIT)]);
          if (v === 'Year') targetDate = startOfYear(selectedDate);

          return (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              className="h-7 w-14 px-3 text-xs capitalize"
              asChild>
              <Link href={getUrl(v, targetDate)}>{v}</Link>
            </Button>
          );
        })}
      </div>
      <Button
        variant={useVat ? 'default' : 'secondary'}
        size="sm"
        className="h-8 min-w-25 text-xs"
        onClick={() => setUseVat(!useVat)}>
        VAT {useVat ? '25.5%' : '0%'}
      </Button>
    </div>
  );
});

interface ChartHeaderProps {
  displayPoint: FormattedPoint | null;
  view: ViewType;
  selectedDate: Date;
  useVat: boolean;
  setUseVat: (useVat: boolean) => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
}

export const ChartHeader = React.memo(function ChartHeader({
  displayPoint,
  view,
  selectedDate,
  useVat,
  setUseVat,
  canGoNext,
  canGoPrev,
}: ChartHeaderProps) {
  return (
    <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-row items-center gap-4 px-4 py-4 sm:px-8 sm:py-6">
        <ChartNavigation
          selectedDate={selectedDate}
          view={view}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
        />

        <PriceDisplay displayPoint={displayPoint} />
      </div>

      <ChartControls
        view={view}
        selectedDate={selectedDate}
        useVat={useVat}
        setUseVat={setUseVat}
      />
    </CardHeader>
  );
});
