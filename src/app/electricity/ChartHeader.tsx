'use client';

import React, { useCallback, useMemo } from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ViewType } from './utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

interface ChartNavigationProps {
  onNext?: () => void;
  onPrev?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  selectedDate: Date;
  view: ViewType;
}

const ChartNavigation = React.memo(function ChartNavigation({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  selectedDate,
  view,
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

  return (
    <div className="flex items-center gap-1 rounded-md border p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onPrev}
        disabled={!canGoPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-24 px-1 text-center text-xs font-medium capitalize tabular-nums">
        {dateLabel}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onNext}
        disabled={!canGoNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

interface PriceDisplayProps {
  displayPoint: any;
  view: ViewType;
}

// Re-render the price display only when the displayPoint changes
const PriceDisplay = React.memo(function PriceDisplay({ displayPoint, view }: PriceDisplayProps) {
  const unit = 'c/kWh';

  const subLabel = useMemo(() => {
    if (!displayPoint || !displayPoint.timestampKey) return '—';
    const date = new Date(displayPoint.timestampKey);

    if (view === 'Day') {
      return displayPoint.interval || displayPoint.formattedTime || '';
    }
    if (view === 'Month') {
      return format(date, 'd.M.yyyy');
    }
    if (view === 'Year') {
      return format(date, 'MMMM yyyy');
    }
    return '';
  }, [displayPoint, view]);

  const hasPrice = displayPoint?.displayPrice !== null && displayPoint?.displayPrice !== undefined;

  return (
    <div className="flex min-h-12 flex-col justify-center">
      <CardTitle className="flex items-baseline gap-2 leading-none">
        <span className="text-primary text-2xl font-black tabular-nums">
          {hasPrice ? displayPoint.displayPrice.toFixed(2) : '—'}
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
  setView: (view: ViewType) => void;
  useVat: boolean;
  setUseVat: (useVat: boolean) => void;
}

const ChartControls = React.memo(function ChartControls({
  view,
  setView,
  useVat,
  setUseVat,
}: ChartControlsProps) {
  const handleToggleVat = useCallback(() => {
    setUseVat(!useVat);
  }, [useVat, setUseVat]);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-8 sm:py-4">
      <div className="flex gap-1 rounded-md border p-1">
        {(['Day', 'Month', 'Year'] as ViewType[]).map((v) => (
          <Button
            key={v}
            variant={view === v ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-14 px-3 text-xs capitalize"
            onClick={() => setView(v)}>
            {v}
          </Button>
        ))}
      </div>
      <Button
        variant={useVat ? 'default' : 'secondary'}
        size="sm"
        className="h-8 min-w-25 text-xs"
        onClick={handleToggleVat}>
        VAT {useVat ? '25.5%' : '0%'}
      </Button>
    </div>
  );
});

interface ChartHeaderProps extends ChartControlsProps {
  displayPoint: any;
  onNext?: () => void;
  onPrev?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  selectedDate: Date;
}

export const ChartHeader = React.memo(function ChartHeader({
  displayPoint,
  view,
  setView,
  useVat,
  setUseVat,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  selectedDate,
}: ChartHeaderProps) {
  return (
    <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-row items-center gap-4 px-4 py-4 sm:px-8 sm:py-6">
        <ChartNavigation
          onNext={onNext}
          onPrev={onPrev}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          selectedDate={selectedDate}
          view={view}
        />

        <PriceDisplay displayPoint={displayPoint} view={view} />
      </div>

      <ChartControls view={view} setView={setView} useVat={useVat} setUseVat={setUseVat} />
    </CardHeader>
  );
});
