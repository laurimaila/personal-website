import {
  format,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  addMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';
import { enGB, fi } from 'date-fns/locale';
import { PricePoint, ViewType } from './types';

export function getFormattedData(
  data: PricePoint[],
  view: ViewType,
  useVat: boolean,
  selectedDate: Date,
) {
  if (!data || data.length === 0) return [];

  if (view === 'Day') {
    const startRange = startOfDay(selectedDate);
    const endRange = endOfDay(selectedDate);

    const dataMap = new Map<number, PricePoint>();
    for (const d of data) {
      const ts = new Date(d.timestamp).getTime();
      if (ts >= startRange.getTime() && ts <= endRange.getTime()) {
        dataMap.set(ts, d);
      }
    }

    const result = [];
    let current = new Date(startRange.getTime());
    let index = 0;

    while (current <= endRange) {
      const ts = current.getTime();
      const d = dataMap.get(ts);
      const next = addMinutes(current, 15);
      const interval = `${format(current, 'HH:mm')} - ${format(next, 'HH:mm')}`;

      result.push({
        timestampKey: ts,
        relativeKey: index,
        displayPrice: d ? (useVat ? d.priceVat : d.price) : null,
        formattedTime: format(current, 'HH:mm'),
        interval,
        fullDate: `${format(current, 'eeee d.M. HH:mm', { locale: enGB })}-${format(next, 'HH:mm')}`,
      });

      current = addMinutes(current, 15);
      index++;
    }
    return result;
  }

  if (view === 'Month') {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const dataMap = new Map<number, PricePoint>();
    for (const d of data) {
      // Normalize timestamp to start of day to ensure matching
      const ts = startOfDay(new Date(d.timestamp)).getTime();
      dataMap.set(ts, d);
    }

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map((day, index) => {
      const ts = startOfDay(day).getTime();
      const d = dataMap.get(ts);
      const displayPrice = d ? (useVat ? d.priceVat : d.price) : null;

      return {
        displayPrice,
        relativeKey: index,
        formattedTime: format(day, 'd.M.'),
        timestampKey: ts,
        fullDate: format(day, 'd.M.yyyy', { locale: enGB }),
      };
    });
  }

  if (view === 'Year') {
    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);

    const dataMap = new Map<number, PricePoint>();
    for (const d of data) {
      const ts = new Date(d.timestamp).getTime();
      dataMap.set(ts, d);
    }

    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    return months.map((month, index) => {
      const ts = month.getTime();
      const d = dataMap.get(ts);
      const displayPrice = d ? (useVat ? d.priceVat : d.price) : null;

      return {
        displayPrice,
        relativeKey: index,
        formattedTime: format(month, 'MMMM', { locale: enGB }),
        timestampKey: ts,
        fullDate: format(month, 'MMMM yyyy', { locale: enGB }),
      };
    });
  }

  return [];
}

export function getNowTimestamp(view: ViewType, now: Date) {
  if (view === 'Day') {
    const minutes = now.getMinutes();
    const fifteenMinutes = Math.floor(minutes / 15) * 15;
    const ts = setMilliseconds(setSeconds(new Date(now), 0), 0);
    ts.setMinutes(fifteenMinutes);
    return ts.getTime();
  }
  if (view === 'Month') {
    return startOfDay(now).getTime();
  }
  if (view === 'Year') {
    return startOfMonth(now).getTime();
  }
  return null;
}
