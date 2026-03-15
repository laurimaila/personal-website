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
import { PriceData } from '@/lib/types';

export type ViewType = 'Day' | 'Month' | 'Year';

export function getFormattedData(
  data: PriceData[],
  view: ViewType,
  useVat: boolean,
  selectedDate: Date,
) {
  if (!data || data.length === 0) return [];

  if (view === 'Day') {
    const startRange = startOfDay(selectedDate);
    const endRange = endOfDay(selectedDate);
    const startTime = startRange.getTime();
    const endTime = endRange.getTime();

    const dataMap = new Map<number, PriceData>();
    for (const d of data) {
      const ts = d.timestamp.getTime();
      if (ts >= startTime && ts <= endTime) {
        dataMap.set(ts, d);
      } else if (ts > endTime) {
        break;
      }
    }

    const result = [];
    let current = new Date(startTime);

    while (current <= endRange) {
      const ts = current.getTime();
      const d = dataMap.get(ts);
      const next = addMinutes(current, 15);
      const interval = `${format(current, 'HH:mm')} - ${format(next, 'HH:mm')}`;

      result.push({
        timestampKey: ts,
        displayPrice: d ? (useVat ? d.priceVat : d.price) : null,
        formattedTime: format(current, 'HH:mm'),
        interval,
        fullDate: `${format(current, 'eeee d.M. HH:mm', { locale: enGB })}-${format(next, 'HH:mm')}`,
      });

      current = new Date(ts + 900000);
    }
    return result;
  }

  if (view === 'Month') {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = nowIfInSameMonth(selectedDate);
    const startTime = monthStart.getTime();

    const dayGroups = new Map<number, number[]>();
    for (const d of data) {
      const ts = d.timestamp.getTime();
      if (ts < startTime) continue;
      if (ts > monthEnd.getTime()) break;

      const dayKey = startOfDay(d.timestamp).getTime();
      if (!dayGroups.has(dayKey)) dayGroups.set(dayKey, []);
      dayGroups.get(dayKey)!.push((useVat ? d.priceVat : d.price) || 0);
    }

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map((day) => {
      const dayTs = day.getTime();
      const prices = dayGroups.get(dayTs) || [];
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      return {
        displayPrice: avgPrice,
        formattedTime: format(day, 'd.M.'),
        timestampKey: dayTs,
        fullDate: format(day, 'eeee d.M.yyyy', { locale: fi }),
      };
    });
  }

  if (view === 'Year') {
    const yearStart = startOfYear(selectedDate);
    const yearEnd = nowIfInSameYear(selectedDate);
    const startTime = yearStart.getTime();

    const monthGroups = new Map<number, number[]>();
    for (const d of data) {
      const ts = d.timestamp.getTime();
      if (ts < startTime) continue;
      if (ts > yearEnd.getTime()) break;

      const monthKey = startOfMonth(d.timestamp).getTime();
      if (!monthGroups.has(monthKey)) monthGroups.set(monthKey, []);
      monthGroups.get(monthKey)!.push((useVat ? d.priceVat : d.price) || 0);
    }

    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    return months.map((month) => {
      const monthTs = month.getTime();
      const prices = monthGroups.get(monthTs) || [];
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      return {
        displayPrice: avgPrice,
        formattedTime: format(month, 'MMMM', { locale: enGB }),
        timestampKey: monthTs,
        fullDate: format(month, 'MMMM yyyy', { locale: enGB }),
      };
    });
  }

  return [];
}

function nowIfInSameMonth(date: Date) {
  const now = new Date();
  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return now;
  }
  return endOfMonth(date);
}

function nowIfInSameYear(date: Date) {
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return now;
  }
  return endOfYear(date);
}

export function getNowTimestamp(view: ViewType) {
  const now = new Date();
  if (view === 'Day') {
    const minutes = now.getMinutes();
    const fifteenMinutes = Math.floor(minutes / 15) * 15;
    const ts = setMilliseconds(setSeconds(now, 0), 0);
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
